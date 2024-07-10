package com.example.myapplication

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.widget.Button
import android.widget.DatePicker
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
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
import java.util.Calendar


class CreateAccount : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_create_account)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val btnInscription = findViewById<Button>(R.id.btn_inscription)
        btnInscription.setOnClickListener {

            val nomInput = findViewById<EditText>(R.id.nomInput)
            val nom = nomInput.text.toString().trim()

            val prenomInput = findViewById<EditText>(R.id.prenomInput)
            val prenom = prenomInput.text.toString().trim()

            val emailInput = findViewById<EditText>(R.id.emailInput)
            val email = emailInput.text.toString().trim()

            val passwordInput = findViewById<EditText>(R.id.passwordInput)
            val password = passwordInput.text.toString().trim()

            val addressInput = findViewById<EditText>(R.id.addressInput)
            val address = addressInput.text.toString().trim()

            val zip_codeInput = findViewById<EditText>(R.id.zip_codeInput)
            val zip_code = zip_codeInput.text.toString().trim()


            val dateInput = findViewById<DatePicker>(R.id.dateInput)
            val day = dateInput.dayOfMonth
            val month = dateInput.month + 1
            val year = dateInput.year

            val selectedDate = String.format("%04d-%02d-%02d", year, month, day)



            if (
                nom.isEmpty() ||
                prenom.isEmpty() ||
                email.isEmpty() ||
                password.isEmpty() ||
                address.isEmpty() ||
                zip_code.isEmpty()
                ){
                Toast.makeText(this@CreateAccount, "Champs obligatoire", Toast.LENGTH_SHORT).show()
            }else if (
                !isValidEmail(email)
            ){
                Toast.makeText(this@CreateAccount, "email incorrect", Toast.LENGTH_SHORT).show()
            } else{
                handleSubmit(nom,prenom,email, password,address,zip_code,selectedDate)
            }


        }


        val Connection = findViewById<TextView>(R.id.connection)
        Connection.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }
    }

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> get() = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> get() = _error

    private var _userId: Int? = null

    fun isValidEmail(email: String): Boolean {
        val emailRegex = Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
        return emailRegex.matches(email)
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


                Pair(responseCode == HttpURLConnection.HTTP_CREATED, responseMessage)
            } catch (e: Exception) {
                Log.e("MyLog", "Error: ${e.message}", e)
                Pair(false, e.message)
            } finally {
                Log.d("MyLog", "ResponseCode: $responseCode")
                Log.d("MyLog", "ResponseMessage: $responseMessage")
            }
        }
    }

    private suspend fun makeApiCallGet(endpoint: String): Pair<Boolean, String?> {
        return withContext(Dispatchers.IO) {
            var responseCode: Int? = null
            var responseMessage: String? = null
            try {
                val url = URL("${MyApp.URL_API}$endpoint")
                val connection = url.openConnection() as HttpURLConnection

                connection.requestMethod = "GET"
                connection.setRequestProperty("Content-Type", "application/json")

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

    @SuppressLint("SetTextI18n", "CommitPrefEdits")
    private fun handleSubmit(lastname: String?, firstname: String?, email: String?, password: String?,address: String?, zipCode: String?, dateOfBirth: String) {
        if (lastname.isNullOrEmpty() ||
            firstname.isNullOrEmpty() ||
            email.isNullOrEmpty() ||
            password.isNullOrEmpty() ||
            address.isNullOrEmpty() ||
            zipCode.isNullOrEmpty()
            ) {
            _error.value = "Please fill in all fields."
            return
        }else if (
            !isValidEmail(email)
        ){
            _error.value = "email fails"
            return
        }

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    put("lastname", lastname)
                    put("firstname", firstname)
                    put("email", email)
                    put("password", password)
                    put("lessor_st", '0')
                    put("date_of_birth", dateOfBirth)
                    put("address", address)
                    put("zip_code", zipCode)
                    put("provider_st", '0')
                }

                Log.e("MyLog", "Error signup: ${formData}")

                // API call for login
                val response = makeApiCall("/api/auth/signup", formData.toString())
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
                sharedPreferences.edit().apply {
                    putString("Email", email)
                    apply()
                }



                val currentDate = Calendar.getInstance()
                val currentDay = currentDate.get(Calendar.DAY_OF_MONTH)
                val currentMonth = currentDate.get(Calendar.MONTH) + 1
                val currentYear = currentDate.get(Calendar.YEAR)
                val Date = String.format("%04d-%02d-%02d", currentYear, currentMonth, currentDay)


                currentDate.add(Calendar.MONTH, 1)
                val nextMonthDay = currentDate.get(Calendar.DAY_OF_MONTH)
                val nextMonthMonth = currentDate.get(Calendar.MONTH) + 1 // Les mois commencent à 0, donc ajoutez 1
                val nextMonthYear = currentDate.get(Calendar.YEAR)
                val DateEnd = String.format("%04d-%02d-%02d", nextMonthYear, nextMonthMonth, nextMonthDay)

//                fetchUserId()
                val response3 = makeApiCallGet("/api/usersMaxId")
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                val data = JSONObject(response3.second)
                val maxId = data.getInt("maxId")

//                handleCreateSub(userId,1,Date,DateEnd,1,1,0)

                val formData2 = JSONObject().apply {
                    put("user_id", maxId)
                    put("subscription_id", 1)
                    put("date_begin", Date)
                    put("date_end", DateEnd)
                    put("payment_st", 1)
                    put("payment_type", 1)
                    put("price", 0)
                }

                Log.e("MyLog", "CreateSub: ${formData2}")

                // API call for login
                val response2 = makeApiCall("/api/userSubscription", formData2.toString())
                if (!response2.first) {
                    throw Exception(response2.second ?: "An error occurred. Please try again.")
                }


                Toast.makeText(this@CreateAccount, "Votre compte a été créé avec succès", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@CreateAccount, VerifAccount::class.java)
                startActivity(intent)
                Log.d("MyLog", "Creation Sub OK")


            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error signup: ${ex.message}")
                if (ex.message?.contains("Failed to connect to") == true || ex.message?.contains("Cleartext HTTP traffic to") == true) {
                    Toast.makeText(this@CreateAccount, "Pas de connexion", Toast.LENGTH_SHORT).show()
                } else if (ex.message?.contains("Password does not meet the requirements") == true) {
                    val builder = AlertDialog.Builder(this@CreateAccount)
                    builder.setTitle("Mot de passe incorrect")
                    builder.setMessage("Mot de passe ne répond pas aux exigences :\n- 12 caractères\n- un symbole\n- minuscule et majuscule")
                    builder.setPositiveButton("OK", null)
                    val dialog = builder.create()
                    dialog.show()

                }else if (ex.message?.contains("Invalid date of birth") == true) {
                    val builder = AlertDialog.Builder(this@CreateAccount)
                    builder.setTitle("Date incorrect")
                    builder.setMessage("La Date ne répond pas aux exigences :\n- Vous devez etre majeur\n- Ne doit pas dépasser la date d'aujourd'hui")
                    builder.setPositiveButton("OK", null)
                    val dialog = builder.create()
                    dialog.show()
                }else if (ex.message?.contains("Email already exists") == true) {
                    Toast.makeText(this@CreateAccount, "Cet email existe déjà", Toast.LENGTH_SHORT).show()
                }
                else {
                    Toast.makeText(this@CreateAccount, "Information invalide", Toast.LENGTH_SHORT).show()
                }
            } finally {
                _loading.value = false

            }
        }
    }


//    private fun handleCreateSub(
//        user_id: Int?, subscription_id: Int?, date_begin: String?, date_end: String?,
//        payment_st: Int?, payment_type: Int?, price: Int?) {
//        if (user_id == null ||subscription_id == null || date_begin.isNullOrEmpty() || date_end.isNullOrEmpty() || payment_st == null || payment_type == null || price == null
//        ) {
//            _error.value = "Please fill in all fields."
//            return
//        }
//
//        _loading.value = true
//        _error.value = null
//
//        CoroutineScope(Dispatchers.Main).launch {
//            try {
//                val formData = JSONObject().apply {
//                    put("user_id", user_id)
//                    put("subscription_id", subscription_id)
//                    put("date_begin", date_begin)
//                    put("date_end", date_end)
//                    put("payment_st", payment_st)
//                    put("payment_type", payment_type)
//                    put("price", price)
//                }
//
//                Log.e("MyLog", "CreateSub: ${formData}")
//
//                // API call for login
//                val response = makeApiCall("/api/userSubscription", formData.toString())
//                if (!response.first) {
//                    throw Exception(response.second ?: "An error occurred. Please try again.")
//                }
//
//
//                Toast.makeText(this@CreateAccount, "Votre compte a été créé avec succès", Toast.LENGTH_SHORT).show()
//                val intent = Intent(this@CreateAccount, VerifAccount::class.java)
//                startActivity(intent)
//                Log.d("MyLog", "Creation Sub OK")
//            } catch (ex: Exception) {
//                _error.value = ex.message
//                Log.e("MyLog", "Error CreateSub: ${ex.message}")
//                Toast.makeText(this@CreateAccount, "Erreur", Toast.LENGTH_SHORT).show()
//            } finally {
//                _loading.value = false
//            }
//        }
//    }

//
//    private fun fetchUserId() {
//        _loading.value = true
//        _error.value = null
//
//        CoroutineScope(Dispatchers.IO).launch {
//            try {
//                val response = makeApiCallGet("/api/usersMaxId")
//                if (!response.first) {
//                    throw Exception(response.second ?: "An error occurred. Please try again.")
//                }
//
//                val data = JSONObject(response.second)
//                val maxId = data.getInt("maxId")
//                _userId = maxId
//
//
//            } catch (ex: Exception) {
//                withContext(Dispatchers.Main) {
//                    _error.value = ex.message
//                    Toast.makeText(
//                        this@CreateAccount,
//                        "Failed to load data: ${ex.message}",
//                        Toast.LENGTH_SHORT
//                    ).show()
//                    Log.e("MyLog", "Error lodgings: ${ex.message}", ex)
//                }
//            } finally {
//                withContext(Dispatchers.Main) {
//                    _loading.value = false
//                }
//            }
//        }
//    }
}