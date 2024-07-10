package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL


class VerifAccount : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_verif_account)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        val email = sharedPreferences.getString("Email","")


        val textView = findViewById<TextView>(R.id.lblVerifEmail)
        val existingText = textView.text.toString()
        val combinedText = existingText +' '+ email
        textView.text = combinedText
        findViewById<TextView>(R.id.lblVerifEmail).text


        val btnSendCode = findViewById<Button>(R.id.btn_SendMail)
        btnSendCode.setOnClickListener {
            handleSubmitCode(email)
        }

        val btnVerifCode = findViewById<TextView>(R.id.btn_verifcode)
        btnVerifCode.setOnClickListener {
            val codeView = findViewById<EditText>(R.id.codeInput)
            val code = codeView.text.toString().trim()
            VerifCode(email,code)
        }
    }

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> get() = _loading


    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> get() = _error




    private suspend fun makeApiCall(endpoint: String, body: String): Pair<Boolean, String?> {
        return withContext(Dispatchers.IO) {
            var responseCode: Int? = null
            var responseMessage: String? = null
            try {
                val url = URL("${MyApp.URL_API}$endpoint")
                val connection = url.openConnection() as HttpURLConnection

                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                // Write request body if provided
                if (body.isNotEmpty()) {
                    OutputStreamWriter(connection.outputStream).use { outputStream ->
                        outputStream.write(body)
                        outputStream.flush()
                    }
                }

                responseCode = connection.responseCode
                responseMessage = if (responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream.bufferedReader().use { it.readText() }
                } else {
                    connection.errorStream?.bufferedReader()?.use { it.readText() }
                }

                Pair(responseCode == HttpURLConnection.HTTP_OK, responseMessage)
            } catch (e: Exception) {
                Log.e("MyLog", "Error: ${e.message}", e)
                Pair(false, e.message)
            } finally {
                Log.d("MyLog", "ResponseCode: $responseCode")
                Log.d("MyLog", "ResponseMessage: $responseMessage")
            }
        }
    }



    private fun handleSubmitCode(email: String?) {

        _loading.value = true
        _error.value = null



        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    put("email", email)
                }

                // API call for login
                val response = makeApiCall("/api/users/verif", formData.toString())
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                Log.d("MyLog", "Code envoyé")
                Toast.makeText(this@VerifAccount, "Code envoyé", Toast.LENGTH_SHORT).show()
            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error Code: ${ex.message}")
                if ((ex.message?.contains("Failed to connect to") == true)|| (ex.message?.contains("Cleartext HTTP traffic to") == true)) {
                    Toast.makeText(this@VerifAccount, "Pas de connexion", Toast.LENGTH_SHORT).show()
                }else{
                    Toast.makeText(this@VerifAccount, "Erreur lors de l'envoi du code", Toast.LENGTH_SHORT).show()
                }
            } finally {
                _loading.value = false
            }
        }
    }

    private fun VerifCode(email: String?,code: String?) {

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    put("email", email)
                    put("code", code)
                }

                // API call for login
                val response = makeApiCall("/api/users/verifCode", formData.toString())
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }



                Toast.makeText(this@VerifAccount, "Compte Confirmé", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@VerifAccount, MainActivity::class.java)
                startActivity(intent)
            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error VerifCode: ${ex.message}")
                if ((ex.message?.contains("Failed to connect to") == true)|| (ex.message?.contains("Cleartext HTTP traffic to") == true)) {
                    Toast.makeText(this@VerifAccount, "Pas de connexion", Toast.LENGTH_SHORT).show()
                }else{
                    Toast.makeText(this@VerifAccount, "Code incorrect", Toast.LENGTH_SHORT).show()
                }
            } finally {
                _loading.value = false
            }
        }
    }



}