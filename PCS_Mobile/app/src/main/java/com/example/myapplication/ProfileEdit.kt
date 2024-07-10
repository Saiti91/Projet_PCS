package com.example.myapplication

import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.MutableLiveData
import com.google.android.material.navigation.NavigationView
import com.squareup.picasso.Picasso
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class ProfileEdit : AppCompatActivity() {

    private val _loading = MutableLiveData<Boolean>()
    private val _error = MutableLiveData<String?>()

    private lateinit var toggle: ActionBarDrawerToggle
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navView: NavigationView

    private var userId: Int = -1
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_profile_edit)
        initializeViews()
        setupDrawer()
        loadUserData()

        DataIntent()

        val btnSave = findViewById<Button>(R.id.profile_btn_save)
        btnSave.setOnClickListener {
            handleSubmit()
        }
    }

    private fun DataIntent() {

        val name = intent.getStringExtra("name")
        val lastname = intent.getStringExtra("lastname")
        val email = intent.getStringExtra("email")
        val date = intent.getStringExtra("date")
        val address = intent.getStringExtra("address")
        val code = intent.getStringExtra("code_zip")

        findViewById<TextView>(R.id.profile_edit_name).hint = name
        findViewById<TextView>(R.id.profile_edit_lastname).hint = lastname
        findViewById<TextView>(R.id.profile_edit_email).hint = email
        findViewById<TextView>(R.id.profile_edit_date).hint = date
        findViewById<TextView>(R.id.profile_edit_address).hint = address
        findViewById<TextView>(R.id.profile_edit_code_zip).hint = code
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun transformerDate(date: String): String {
        // Définir le format du date d'entrée (DD/MM/YYYY)
        val formatEntree = DateTimeFormatter.ofPattern("dd/MM/yyyy")

        // Parser la date d'entrée pour obtenir un objet LocalDate
        val dateLocal = LocalDate.parse(date, formatEntree)

        // Définir le format de sortie (YYYY-MM-DD)
        val formatSortie = DateTimeFormatter.ofPattern("yyyy-MM-dd")

        // Formater la date au nouveau format
        return dateLocal.format(formatSortie)
    }

    fun isValidEmail(email: String): Boolean {
        // Expression régulière améliorée pour vérifier l'adresse email
        val emailRegex = Regex(
            "^[a-zA-Z0-9.!#\$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\$"
        )
        // Retourne true si l'email correspond à l'expression régulière, false sinon
        Log.e("MyLog2", emailRegex.matches(email).toString())
        return emailRegex.matches(email)
    }


    @RequiresApi(Build.VERSION_CODES.O)
    private fun handleSubmit() {

        _loading.value = true
        _error.value = null

        val nameInput = findViewById<EditText>(R.id.profile_edit_name)
        var name = nameInput.text.toString().trim()

        val lastnameInput = findViewById<EditText>(R.id.profile_edit_lastname)
        var lastname = lastnameInput.text.toString().trim()

        val emailInput = findViewById<EditText>(R.id.profile_edit_email)
        var email = emailInput.text.toString().trim()

        val dateInput = findViewById<EditText>(R.id.profile_edit_date)
        var date = dateInput.text.toString().trim()

        val addressInput = findViewById<EditText>(R.id.profile_edit_address)
        var address = addressInput.text.toString().trim()

        val codeInput = findViewById<EditText>(R.id.profile_edit_code_zip)
        var code = codeInput.text.toString().trim()



        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    if (name.isNotEmpty()) {
                        put("lastname", name)
                    }
                    if (lastname.isNotEmpty()) {
                        put("firstname", lastname)
                    }
                    if (email.isNotEmpty()) {
                        if (isValidEmail(email)) {
                            put("email", email)
                        } else {
                            throw Exception("Email Invalide")
                        }
                    }
                    if (date.isNotEmpty()) {
                        put("date_of_birth", transformerDate(date))
                    }
                    if (address.isNotEmpty()) {
                        put("address", address)
                    }
                    if (code.isNotEmpty()) {
                        put("zip_code", code)
                    }

                }

                // API call for login
                val response = makeApiCallPUT("/api/users/$userId", formData.toString())
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                Toast.makeText(
                    this@ProfileEdit,
                    "Reconnectez-vous pour voir les changements",
                    Toast.LENGTH_LONG
                ).show()
                val intent = Intent(this@ProfileEdit, Profile::class.java)
                startActivity(intent)
            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error ProfileEdit : ${ex.message}")
                Toast.makeText(this@ProfileEdit, "Information incorrect", Toast.LENGTH_SHORT).show()

            } finally {
                _loading.value = false
            }
        }
    }

    private suspend fun makeApiCallPUT(endpoint: String, body: String): Pair<Boolean, String?> {
        return withContext(Dispatchers.IO) {
            var responseCode: Int? = null
            var responseMessage: String? = null
            try {
                val url = URL("${MyApp.URL_API}$endpoint")
                val connection = url.openConnection() as HttpURLConnection

                connection.requestMethod = "PUT"
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

    private fun initializeViews() {
        drawerLayout = findViewById(R.id.profile_edit)
        navView = findViewById(R.id.nav_view)

        // Handling window insets
        ViewCompat.setOnApplyWindowInsetsListener(drawerLayout) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val btnMenu = findViewById<ImageView>(R.id.burger_menu)
        btnMenu.setOnClickListener {
            if (!drawerLayout.isDrawerOpen(navView)) {
                drawerLayout.openDrawer(navView)
            } else {
                drawerLayout.closeDrawer(navView)
            }
        }
    }

    private fun setupDrawer() {
        toggle = ActionBarDrawerToggle(this, drawerLayout, R.string.open, R.string.close)
        drawerLayout.addDrawerListener(toggle)
        toggle.syncState()

        navView.setNavigationItemSelectedListener { menuItem ->
            when (menuItem.itemId) {
                R.id.nav_home -> {
                    val intent = Intent(this@ProfileEdit, ListLodging::class.java)
                    startActivity(intent)
                }

                R.id.nav_profil -> {
                    val intent = Intent(this@ProfileEdit, Profile::class.java)
                    startActivity(intent)
                }

                R.id.nav_login -> {
                    clearPreferencesAndLogout()
                }
            }
            true
        }
    }

    private fun clearPreferencesAndLogout() {
        val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        with(sharedPreferences.edit()) {
            clear()
            apply()
        }
        val intent = Intent(this@ProfileEdit, MainActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun loadUserData() {
        val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        val userEmail = sharedPreferences.getString("userEmail", null)
        val userLastname = sharedPreferences.getString("userLastname", null)
        val userFirstname = sharedPreferences.getString("userFirstname", null)
        val userPfp = sharedPreferences.getString("userPfp", null)

        val headerView = navView.getHeaderView(0)
        val userEmailTextView: TextView = headerView.findViewById(R.id.user_address)
        userEmailTextView.text = userEmail

        val userNameTextView: TextView = headerView.findViewById(R.id.user_name)
        userNameTextView.text = "$userLastname $userFirstname"

        val userUrlCircleImageView: CircleImageView = headerView.findViewById(R.id.user_img)
        val url = "${MyApp.URL_WEB}$userPfp"
        Picasso.get().load(url).into(userUrlCircleImageView)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return if (toggle.onOptionsItemSelected(item)) {
            true
        } else {
            super.onOptionsItemSelected(item)
        }
    }

    override fun onResume() {
        super.onResume()
        checkUserLoggedIn()
    }

    private fun checkUserLoggedIn() {
        val sharedPreferences: SharedPreferences =
            getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        val token: String? = sharedPreferences.getString("token", null)
        userId = sharedPreferences.getInt("userId", -1)

        if (token.isNullOrEmpty()) {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}