package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class RatingStarsBtn @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private val totalStars = 5
    private var note = 0
    private val starViews = mutableListOf<ImageView>()

    init {
        orientation = LinearLayout.HORIZONTAL
        for (i in 0 until totalStars) {
            val star = ImageView(context)
            val params = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
            star.layoutParams = params
            star.setImageResource(android.R.drawable.star_off)
            starViews.add(star)
            addView(star)
            star.setOnClickListener {
                setNoteValue(i + 1)
            }
        }
    }

    fun setNoteValue(value: Int) {
        note = value
        val sharedPreferences = context.getSharedPreferences("MyAppPreferences", AppCompatActivity.MODE_PRIVATE)
        sharedPreferences.edit().apply {
            putInt("note", note)
            apply()
        }
        updateStars()
    }

    private fun updateStars() {
        for (i in 0 until totalStars) {
            if (i < note) {
                starViews[i].setImageResource(R.drawable.yellow_star) // Ensure this drawable exists
            } else {
                starViews[i].setImageResource(android.R.drawable.star_off)
            }
        }
    }
}
