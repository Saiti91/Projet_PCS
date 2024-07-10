package com.example.myapplication

import CommentAdapter
import ServiceAdapter
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.util.DisplayMetrics
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
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
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class SettingLodging : AppCompatActivity() {

    private val _loading = MutableLiveData<Boolean>()
    private val _error = MutableLiveData<String?>()

    private lateinit var toggle: ActionBarDrawerToggle
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var navView: NavigationView

    private var ImgLodgingId: Int = -1

    private var userId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_setting_lodging)

        val lodgingId = intent.getIntExtra("lodgingId", -1)
        fetchLodgings(lodgingId)
        fetchLodgingsServices(lodgingId)
        fetchLodgingsComments(lodgingId)

        initializeViews()
        setupDrawer()

        loadUserData()

        val btnComment = findViewById<Button>(R.id.btn_commentInput)
        btnComment.setOnClickListener {
            val commentInput = findViewById<EditText>(R.id.commentInput)
            val comment = commentInput.text.toString().trim()
            val sharedPreferences = getSharedPreferences("MyAppPreferences", Context.MODE_PRIVATE)
            val note = sharedPreferences.getInt("note", 0) // 0 is the default value if 'note' key doesn't exist


            if (comment.isNullOrEmpty()) {
                Toast.makeText(this@SettingLodging, "Champs obligatoire", Toast.LENGTH_SHORT).show()
            } else {
                handleSubmit(note, comment, lodgingId)
            }


        }
    }

    private fun initializeViews() {
        drawerLayout = findViewById(R.id.drawLayout_setting_lodging)
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
                    val intent = Intent(this@SettingLodging, ListLodging::class.java)
                    startActivity(intent)
                }

                R.id.nav_profil -> {
                    val intent = Intent(this@SettingLodging, Profile::class.java)
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
        val intent = Intent(this@SettingLodging, MainActivity::class.java)
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

    private fun fetchLodgings(lodgingId: Int) {
        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = makeApiCallGET("/api/lodgings/$lodgingId")
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                val dataObject = JSONObject(response.second!!)

                val address = dataObject.getString("address")
                val city = dataObject.getString("city")
                val zipCode = dataObject.getString("zip_code_lodging")
                val price = dataObject.getInt("price")
                val description = dataObject.getString("description")
                val capacity = dataObject.getInt("capacity")
                val surface = dataObject.getString("surface")
                val title = dataObject.getString("title")
                val rating = dataObject.getInt("rating")
                ImgLodgingId = dataObject.optInt("img_lodging_id",-1)

                val userObject = dataObject.getJSONObject("user")
                val firstName = userObject.getString("firstname")
                val lastName = userObject.getString("lastname")

                val TxtTitre = findViewById<TextView>(R.id.lodging_title)
                TxtTitre.text = title

                val ratingStars = findViewById<RatingStars>(R.id.ratingStars)
                ratingStars.setNoteValue(rating)

                val TxtAddress = findViewById<TextView>(R.id.lodging_address)
                TxtAddress.text =
                    TxtAddress.text.toString() + ' ' + address + ", " + city + ", " + zipCode

                val TxtPrice = findViewById<TextView>(R.id.lodging_price)
                TxtPrice.text = TxtPrice.text.toString() + ' ' + price + " € / Jour"

                val TxtSurface = findViewById<TextView>(R.id.lodging_surface)
                TxtSurface.text = TxtSurface.text.toString() + ' ' + surface + " M²"

                val TxtCapacity = findViewById<TextView>(R.id.lodging_capacity)
                TxtCapacity.text = TxtCapacity.text.toString() + ' ' + capacity

                val TxtUser = findViewById<TextView>(R.id.lodging_user)
                TxtUser.text = firstName + ' ' + lastName

                findViewById<TextView>(R.id.lodging_description).text = description
                findViewById<RatingStars>(R.id.ratingStars).setNoteValue(rating)

//                if (ImgLodgingId != -1){
//                    fetchImgLodgings(lodgingId)
//                }


            } catch (ex: Exception) {
                _error.value = ex.message
                Toast.makeText(this@SettingLodging, "Erreur de changement", Toast.LENGTH_SHORT)
                    .show()
                Log.e("MyLog", "Error lodgings: ${ex.message}")
            } finally {
                _loading.value = false
            }
        }
    }

//    private fun fetchImgLodgings(lodgingId: Int) {
//        CoroutineScope(Dispatchers.IO).launch {
//            try {
//                val response = makeApiCallGET("/api/imgLodgings/$lodgingId")
//                if (!response.first) {
//                    throw Exception(response.second ?: "An error occurred. Please try again.")
//                }
//
//                val data = JSONArray(response.second!!)
//
//                withContext(Dispatchers.Main) {
//                    val imageContainer = findViewById<LinearLayout>(R.id.image_list_container)
//                    imageContainer.removeAllViews()
//
//                    val displayMetrics = DisplayMetrics()
//                    windowManager.defaultDisplay.getMetrics(displayMetrics)
//                    val screenWidth = displayMetrics.widthPixels
//
//                    for (i in 0 until data.length()) {
//                        val jso = data.getJSONObject(i)
//                        val imageUrl = jso.getString("url")
//                        val imageId = jso.getInt("img_lodging_id")
//
//                        val imageView = ImageView(this@SettingLodging)
//                        imageView.layoutParams = LinearLayout.LayoutParams(
//                            screenWidth,
//                            ViewGroup.LayoutParams.MATCH_PARENT
//                        )
//                        imageView.scaleType = ImageView.ScaleType.CENTER_CROP
//                        imageView.setPadding(8, 8, 8, 8)
//                        Picasso.get().load(MyApp.URL_WEB + imageUrl).into(imageView)
//
//                        Log.d("MyLog2", "imageId: $imageId, ImgLodgingId: $ImgLodgingId")
//
//                        if (imageId == ImgLodgingId) {
//                            imageContainer.addView(imageView, 0)  // Add to the beginning
//                        } else {
//                            imageContainer.addView(imageView)
//                        }
//                    }
//                }
//
//            } catch (ex: Exception) {
//                withContext(Dispatchers.Main) {
//                    Toast.makeText(
//                        this@SettingLodging,
//                        "Failed to load images: ${ex.message}",
//                        Toast.LENGTH_SHORT
//                    ).show()
//                    Log.e("SettingLodging", "Error fetching images: ${ex.message}", ex)
//                }
//            }
//        }
//    }

    private fun fetchLodgingsServices(lodgingId: Int) {

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = makeApiCallGET("/api/lodgingServices/$lodgingId")

                if (!response.first) {
                    throw Exception(
                        response.second ?: "Une erreur est survenue. Veuillez réessayer."
                    )
                }

                val data = JSONArray(response.second)
                val listLodgingsServices = mutableListOf<Service>()

                for (i in 0 until data.length()) {
                    val jsonObject = data.getJSONObject(i)
                    val serviceJson = jsonObject.optJSONObject("service")

                    val serviceId = serviceJson?.optInt("service_id", -1) ?: -1
                    val serviceName = serviceJson?.optString("name_service", "")
                    val serviceDescription = serviceJson?.optString("description", "")
                    val servicePrice = serviceJson?.optInt("price", 0) ?: 0

                    val service = Service(
                        serviceId,
                        serviceName,
                        serviceDescription,
                        servicePrice
                    )
                    listLodgingsServices.add(service)
                }

                // Met à jour l'adaptateur avec les données récupérées
                val adapter = ServiceAdapter(this@SettingLodging, listLodgingsServices)
                val listView = findViewById<ListView>(R.id.list_lodgings_services)
                listView.adapter = adapter

                // Calculer la hauteur totale des éléments de la liste pour ajuster la hauteur de ListView
                var totalHeight = 0
                for (i in 0 until adapter.count) {
                    val listItem = adapter.getView(i, null, listView)
                    listItem.measure(
                        View.MeasureSpec.UNSPECIFIED,
                        View.MeasureSpec.UNSPECIFIED
                    )
                    totalHeight += listItem.measuredHeight
                }

                val params = listView.layoutParams
                params.height = totalHeight + (listView.dividerHeight * (adapter.count - 1))
                listView.layoutParams = params
                listView.requestLayout()

            } catch (ex: Exception) {
                // Gère les exceptions et affiche un message d'erreur
                _error.value = ex.message
                Toast.makeText(
                    this@SettingLodging,
                    "Impossible de charger les données",
                    Toast.LENGTH_SHORT
                ).show()
                Log.e("MyLog", "Erreur lors de la récupération des services: ${ex.message}")
            } finally {
                // Indique que le chargement est terminé
                _loading.value = false
            }
        }
    }

    private fun fetchLodgingsComments(lodgingId: Int) {

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = makeApiCallGET("/api/commentsLodging/lodging/$lodgingId")

                if (!response.first) {
                    throw Exception(
                        response.second ?: "Une erreur est survenue. Veuillez réessayer."
                    )
                }

                // Parse le JSON en utilisant JSONArray et JSONObject
                val data = JSONArray(response.second)
                val comments = mutableListOf<Comment>()

                for (i in 0 until data.length()) {
                    val jsonObject = data.getJSONObject(i)

                    val note_id = jsonObject.optInt("note_id", -1)
                    val note = jsonObject.optInt("note", -1)
                    val content = jsonObject.optString("content", "")
                    val lodging_id = jsonObject.optInt("lodging_id", -1)
                    val date = jsonObject.optString("date", "")
                    val count_like = jsonObject.optInt("count_like", 0)
                    val reponse_note_id =
                        if (jsonObject.isNull("reponse_note_id")) null else jsonObject.getInt("reponse_note_id")

                    val userJson = jsonObject.getJSONObject("user")
                    val user_id = userJson.optInt("user_id", -1)
                    val lastname = userJson.optString("lastname", "")
                    val firstname = userJson.optString("firstname", "")

                    val comment = Comment(
                        note_id = note_id,
                        note = note,
                        content = content,
                        lodging_id = lodging_id,
                        user_id = user_id,
                        date = date,
                        count_like = count_like,
                        reponse_note_id = reponse_note_id,
                        lastname = lastname,
                        firstname = firstname
                    )
                    comments.add(comment)
                }

                // Trier les commentaires par note_id décroissant
                val sortedComments = comments.sortedByDescending { it.note_id }

                // Mettre à jour l'adaptateur avec les données triées
                val adapter = CommentAdapter(this@SettingLodging, sortedComments)
                val listView = findViewById<ListView>(R.id.list_lodgings_comment)
                listView.adapter = adapter

                // Calculer la hauteur totale des éléments de la liste pour ajuster la hauteur de ListView
//                var totalHeight = 0
//                for (i in 0 until adapter.count) {
//                    val listItem = adapter.getView(i, null, listView)
//                    listItem.measure(
//                        View.MeasureSpec.UNSPECIFIED,
//                        View.MeasureSpec.UNSPECIFIED
//                    )
//                    totalHeight += listItem.measuredHeight
//                }
//
//                val params = listView.layoutParams
//                params.height = totalHeight + (listView.dividerHeight * (adapter.count - 1))
//                listView.layoutParams = params
//                listView.requestLayout()

            } catch (ex: Exception) {
                // Gérer les exceptions et afficher un message d'erreur
                _error.value = ex.message
                Toast.makeText(
                    this@SettingLodging,
                    "Impossible de charger les données",
                    Toast.LENGTH_SHORT
                ).show()
                Log.e("MyLog", "Erreur lors de la récupération des commentaires : ${ex.message}")
            } finally {
                // Indiquer que le chargement est terminé
                _loading.value = false
            }
        }
    }

    private fun handleSubmit(note: Int?, content: String?, lodgingId: Int) {
        if (content.isNullOrEmpty()) {
            _error.value = "Please fill in all fields."
            return
        }

        _loading.value = true
        _error.value = null

        CoroutineScope(Dispatchers.Main).launch {
            try {
                val formData = JSONObject().apply {
                    put("note", note)
                    put("content", content)
                    put("lodging_id", lodgingId)
                    put("user_id", userId)
                }

                // API call for login
                val response = makeApiCallPOST("/api/commentsLodging", formData.toString())
                Log.e("MyLog", "Error comment: ${response}")
                if (!response.first) {
                    throw Exception(response.second ?: "An error occurred. Please try again.")
                }

                Toast.makeText(this@SettingLodging, "Comment successful", Toast.LENGTH_SHORT).show()
                fetchLodgingsComments(lodgingId)
            } catch (ex: Exception) {
                _error.value = ex.message
                Log.e("MyLog", "Error comment: ${ex.message}")
                Toast.makeText(this@SettingLodging, "Erreur lors de l'envoie", Toast.LENGTH_SHORT)
                    .show()
            } finally {
                _loading.value = false
            }
        }
    }


    private suspend fun makeApiCallPOST(endpoint: String, body: String): Pair<Boolean, String?> {
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
                responseMessage = if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                    connection.inputStream.bufferedReader().use { it.readText() }
                } else {
                    connection.errorStream?.bufferedReader()?.use { it.readText() }
                }

                Pair(responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED, responseMessage)
            } catch (e: Exception) {
                Log.e("MyLog", "Error: ${e.message}", e)
                Pair(false, e.message)
            } finally {
                Log.d("MyLog", "ResponseCode: $responseCode")
                Log.d("MyLog", "ResponseMessage: $responseMessage")
            }
        }
    }



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
