import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.Button
import android.widget.ImageView
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.lifecycle.MutableLiveData
import com.example.myapplication.Comment
import com.example.myapplication.MyApp
import com.example.myapplication.R
import com.example.myapplication.RatingStars
import com.example.myapplication.SettingLodging
import com.squareup.picasso.Picasso
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import kotlin.math.absoluteValue


class CommentAdapter(private val context: Context, private val listComment: List<Comment>) : BaseAdapter() {

    private val sharedPreferences = context.getSharedPreferences("MyAppPreferences", Context.MODE_PRIVATE)
    private val userId: Int = sharedPreferences.getInt("userId", -1)

    override fun getCount(): Int = listComment.size

    override fun getItem(position: Int): Any = listComment[position]

    override fun getItemId(position: Int): Long = position.toLong()

    @RequiresApi(Build.VERSION_CODES.O)
    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        val view: View
        val viewHolder: ViewHolder

        if (convertView == null) {
            view = LayoutInflater.from(context).inflate(R.layout.row_comment, parent, false)
            viewHolder = ViewHolder(view)
            view.tag = viewHolder
        } else {
            view = convertView
            viewHolder = view.tag as ViewHolder
        }

        val currentComment = getItem(position) as Comment
        viewHolder.bind(currentComment, userId,context)

        return view
    }

    private class ViewHolder(view: View) {
        private val commentNameTextView: TextView = view.findViewById(R.id.row_comment_name)
        private val commentLastnameTextView: TextView = view.findViewById(R.id.row_comment_lastname)
        private val commentDateTextView: TextView = view.findViewById(R.id.row_comment_date)
        private val commentDescriptionTextView: TextView = view.findViewById(R.id.row_comment_description)
        private val commentCountTextView: TextView = view.findViewById(R.id.row_comment_count)
        private val ratingStars: RatingStars = view.findViewById(R.id.ratingStars)
        private val commentHeartImageView: ImageView = view.findViewById(R.id.row_comment_heart)
        private val commentBtnSupp: Button = view.findViewById(R.id.row_comment_btn_supp)
        @RequiresApi(Build.VERSION_CODES.O)
        fun bind(comment: Comment, userId: Int,context: Context) {
            commentNameTextView.text = comment.firstname
            commentLastnameTextView.text = comment.lastname
            commentDateTextView.text = convertDate(comment.date)
            commentDescriptionTextView.text = comment.content
            commentCountTextView.text = comment.count_like.toString()
            ratingStars.setNoteValue(comment.note)

//            val heartImageRes = if (comment.user_id == userId) {
//                R.drawable.coeur_rouge
//            } else {
//                R.drawable.coeur_vide
//            }
//            Picasso.get().load(heartImageRes).into(commentHeartImageView)
            Picasso.get().load(R.drawable.coeur_rouge).into(commentHeartImageView)

            if (userId == comment.user_id) {
                commentBtnSupp.setVisibility(View.VISIBLE);
            } else {
                commentBtnSupp.setVisibility(View.GONE);
            }

            commentBtnSupp.setOnClickListener{
                Delete(comment.note_id ,comment.lodging_id,context)
            }

        }

        @RequiresApi(Build.VERSION_CODES.O)
        private fun convertDate(date: String): String {
            val now = LocalDateTime.now()
            val givenDate = LocalDateTime.parse(date, DateTimeFormatter.ISO_DATE_TIME)
            val diffInSeconds = ChronoUnit.SECONDS.between(givenDate, now).absoluteValue
            val diffInMinutes = diffInSeconds / 60
            val diffInHours = diffInMinutes / 60
            val diffInDays = diffInHours / 24
            val diffInMonths = diffInDays / 30

            return when {
                diffInMonths >= 6 -> {
                    val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy")
                    "le ${givenDate.format(formatter)}"
                }
                diffInDays >= 30 -> "il y a $diffInMonths mois"
                diffInHours >= 24 -> "il y a $diffInDays jour${if (diffInDays != 1L) "s" else ""}"
                diffInMinutes >= 60 -> "il y a $diffInHours heure${if (diffInHours != 1L) "s" else ""}"
                else -> "il y a $diffInMinutes minute${if (diffInMinutes != 1L) "s" else ""}"
            }
        }

        private val _loading = MutableLiveData<Boolean>()
        private val _error = MutableLiveData<String?>()

        private fun Delete(noteId: Int,lodgingId:Int,context: Context) {

            _loading.value = true
            _error.value = null

            CoroutineScope(Dispatchers.Main).launch {
                try {
                    val response = makeApiCallDELETE("/api/commentsLodging/$noteId")

                    if (!response.first) {
                        throw Exception(
                            response.second ?: "Une erreur est survenue. Veuillez réessayer."
                        )
                    }


                        Log.e("MyLog2",noteId.toString())
                        val intent = Intent(context, SettingLodging::class.java).apply {
                            putExtra("lodgingId", lodgingId)
                        }
                        context.startActivity(intent)


                } catch (ex: Exception) {
                    // Gérer les exceptions et afficher un message d'erreur
                    _error.value = ex.message
                    Log.e("MyLog", "Erreur lors de la récupération des commentaires : ${ex.message}")
                } finally {
                    // Indiquer que le chargement est terminé
                    _loading.value = false
                }
            }
        }
        private suspend fun makeApiCallDELETE(endpoint: String): Pair<Boolean, String?> {
            return withContext(Dispatchers.IO) {
                var connection: HttpURLConnection? = null
                var responseCode: Int? = null
                var responseMessage: String? = null

                try {
                    val url = URL("${MyApp.URL_API}$endpoint")
                    connection = url.openConnection() as HttpURLConnection
                    connection.requestMethod = "DELETE"
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
    }
}
