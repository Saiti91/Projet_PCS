package com.example.myapplication

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.ActionBarDrawerToggle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.MutableLiveData
import com.auth0.android.jwt.JWT
import com.google.android.material.navigation.NavigationView
import com.squareup.picasso.Picasso
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone



class Profile : AppCompatActivity() {

    private val _loading = MutableLiveData<Boolean>()
    private val _error = MutableLiveData<String?>()

    private lateinit var toggle: ActionBarDrawerToggle
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navView: NavigationView

    private var userId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_profile)

        initializeViews()
        setupDrawer()
        loadUserData()

        fetchinfo()

        val btnModify = findViewById<Button>(R.id.profile_btn_modify)
        btnModify.setOnClickListener {
            val name = findViewById<TextView>(R.id.profile_name).text
            val lastname = findViewById<TextView>(R.id.profile_lastname).text
            val email = findViewById<TextView>(R.id.profile_email).text
            val date = findViewById<TextView>(R.id.profile_date).text
            val address = findViewById<TextView>(R.id.profile_address).text
            val code = findViewById<TextView>(R.id.profile_code_zip).text

            val intent = Intent(this@Profile, ProfileEdit::class.java).apply {
                putExtra("name", name)
                putExtra("lastname", lastname)
                putExtra("email", email)
                putExtra("date", date)
                putExtra("address", address)
                putExtra("code_zip", code)
            }
            startActivity(intent)

        }
    }

//    private fun fetchuser() {
//        _loading.value = true
//        _error.value = null
//
//        CoroutineScope(Dispatchers.Main).launch {
//            try {
//                val response = makeApiCallGET("/api/users/$userId")
//                if (!response.first) {
//                    throw Exception(response.second ?: "An error occurred. Please try again.")
//                }
//
//                val dataObject = JSONObject(response.second!!)
//
//                val lastname = dataObject.getString("lastname")
//                val firstname = dataObject.getString("firstname")
//                val email = dataObject.getString("email")
//                val dateOfBirth = dataObject.getString("date_of_birth")
//                val address = dataObject.getString("address")
//                val zip_code = dataObject.getInt("zip_code")
//                val pfp = dataObject.getString("pfp")
//
//                val TxtName = findViewById<TextView>(R.id.profile_name)
//                TxtName.text = lastname
//
//                val TxtLastname = findViewById<TextView>(R.id.profile_lastname)
//                TxtLastname.text = firstname
//
//                val TxtEmail = findViewById<TextView>(R.id.profile_email)
//                TxtEmail.text = email
//
//                val TxtDate = findViewById<TextView>(R.id.profile_date)
//                TxtDate.text = formatDate(dateOfBirth)
//
//                val TxtAddress = findViewById<TextView>(R.id.profile_address)
//                TxtAddress.text = address
//
//                val TxtCode = findViewById<TextView>(R.id.profile_code_zip)
//                TxtCode.text = zip_code.toString()
//
//                val ImgPfp = findViewById<CircleImageView>(R.id.user_pfp)
//                val url = "${MyApp.URL_WEB}$pfp"
//                Picasso.get().load(url).into(ImgPfp)
//
//            } catch (ex: Exception) {
//                _error.value = "An error occurred. Please try again."
//                Toast.makeText(this@Profile, "Error fetching user data", Toast.LENGTH_SHORT).show()
//                Log.e("MyLog", "Error fetching user data: ${ex.message}", ex)
//            } finally {
//                _loading.value = false
//            }
//        }
//    }

    private suspend fun makeApiCallGET(endpoint: String): Pair<Boolean, String?> {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            var responseCode: Int? = null
            var responseMessage: String? = null

            try {
                val url = URL("${MyApp.URL_API}$endpoint")
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.setRequestProperty("Content-Type", "application/json")

                responseCode = connection.responseCode
                responseMessage = if (responseCode == HttpURLConnection.HTTP_OK ) {
                    connection.inputStream.bufferedReader().use { it.readText() }
                } else {
                    connection.errorStream?.bufferedReader()?.use { it.readText() }
                }

                Pair(responseCode == HttpURLConnection.HTTP_OK, responseMessage)
            } catch (e: Exception) {
                Log.e("SettingLodging", "Error: ${e.message}", e)
                Pair(false, e.message)
            } finally {
                connection?.disconnect()
                Log.d("SettingLodging", "ResponseCode: $responseCode")
                Log.d("SettingLodging", "ResponseMessage: $responseMessage")
            }
        }
    }

    private fun initializeViews() {
        drawerLayout = findViewById(R.id.profile)
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
                    val intent = Intent(this@Profile, ListLodging::class.java)
                    startActivity(intent)
                }
                R.id.nav_profil -> {
                    val intent = Intent(this@Profile, Profile::class.java)
                    startActivity(intent)
                }
                R.id.nav_login -> {
                    clearPreferencesAndLogout()
                }
            }
            true
        }
    }

    private fun formatDate(dateString: String): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        dateFormat.timeZone = TimeZone.getTimeZone("UTC")
        val dateOfBirth: Date = dateFormat.parse(dateString) ?: Date()

        val sdf = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
        return sdf.format(dateOfBirth)
    }


    private fun clearPreferencesAndLogout() {
        val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        with(sharedPreferences.edit()) {
            clear()
            apply()
        }
        val intent = Intent(this@Profile, MainActivity::class.java)
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
        userEmailTextView.text = userEmail ?: "Email not set"

        val userNameTextView: TextView = headerView.findViewById(R.id.user_name)
        userNameTextView.text = "${userLastname ?: ""} ${userFirstname ?: ""}".trim()

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

    private suspend fun makeApiCallinfo(endpoint: String): Pair<Boolean, String?> {
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

    private fun fetchinfo() {

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
                val token = sharedPreferences.getString("token", null)

                val decodedToken = JWT(token ?: throw Exception("Token is null or empty"))
                val userId = decodedToken.getClaim("userId").asInt()
                val response = makeApiCallinfo("/user/$userId")
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                val data = JSONArray(response.second)
                val listLodgings = mutableListOf<Lodging>()

                val editor = sharedPreferences.edit()

                val jso = data.getJSONObject(0)
                editor.apply {
                    putInt("last_name", jso.getInt("last_name"))
                    putInt("first_name", jso.getInt("first_name"))
                    putString("email", jso.getString("email"))
                    putString("telephone", jso.getString("telephone"))
                    putString("address", jso.getString("address"))
                    apply()
                }

            } catch (ex: Exception) {
                _error.value = ex.message
                Toast.makeText(this@Profile, "Impossible de charger les données", Toast.LENGTH_SHORT).show()
                Log.e("MyLog", "Error lodgings: ${ex.message}")
            } finally {
                _loading.value = false
            }
        }
    }
}
