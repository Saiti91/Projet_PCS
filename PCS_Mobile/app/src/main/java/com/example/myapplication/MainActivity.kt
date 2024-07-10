package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.*
import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter
import org.json.JSONObject
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.TextView
import com.auth0.android.jwt.JWT
import org.json.JSONArray

//import com.auth0.android.jwt.JWTDecodeException

class MainActivity : AppCompatActivity() {

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> get() = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> get() = _error

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Configure window insets listener
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val btnConnection = findViewById<Button>(R.id.btn_connection)
        btnConnection.setOnClickListener {
            val emailInput = findViewById<EditText>(R.id.emailInput)
            val email = emailInput.text.toString().trim()

            val passwordInput = findViewById<EditText>(R.id.passwordInput)
            val password = passwordInput.text.toString().trim()

            if (email.isNullOrEmpty() || password.isNullOrEmpty()) {
                Toast.makeText(this@MainActivity, "Champs obligatoire", Toast.LENGTH_SHORT).show()
            } else {
                handleSubmit(email, password)
            }


        }

        val btnCreateAccount = findViewById<TextView>(R.id.createAccount)
        btnCreateAccount.setOnClickListener {
            val intent = Intent(this@MainActivity, CreateAccount::class.java)
            startActivity(intent)
        }
    }

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

    private fun handleSubmit(email: String?, password: String?) {
        if (email.isNullOrEmpty() || password.isNullOrEmpty()) {
            _error.value = "Please fill in all fields."
            return
        }

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    put("email", email)
                    put("password", password)
                }

                // API call for login
                val response = makeApiCall("/auth/login", formData.toString())
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                // Response API
                val data = JSONObject(response.second)
                val token = data.optString("token")
                val user = data.optJSONObject("user")


                val userEmail = user?.optString("email")
                val userInfo = user?.toString()
                val userId = user?.optInt("address_id")
                val userLastname = user?.optString("last_name")
                val userFirstname = user?.optString("first_name")
                //val userPfp = user?.optString("pfp")


                // Save data
                val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
                sharedPreferences.edit().apply {
                    putString("token", token)
                    putString("userInfo", userInfo)
                    if (userId != null) {
                        putInt("userId", userId)
                    }
                    putString("userEmail", userEmail)
                    putString("userLastname", userLastname)
                    putString("userFirstname", userFirstname)
                    //putString("userPfp", userPfp)
                    apply()
                }


                Toast.makeText(this@MainActivity, "Login successful", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@MainActivity, ListLodging::class.java)
                startActivity(intent)
            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error signin: ${ex.message}")
                if ((ex.message?.contains("Failed to connect to") == true) || (ex.message?.contains(
                        "Cleartext HTTP traffic to"
                    ) == true)
                ) {
                    Toast.makeText(this@MainActivity, "Pas de connexion", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@MainActivity, "Identifiant invalide", Toast.LENGTH_SHORT)
                        .show()
                }
            } finally {
                _loading.value = false
            }
        }
    }


}


