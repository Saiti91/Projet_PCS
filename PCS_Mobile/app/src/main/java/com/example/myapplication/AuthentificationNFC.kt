package com.example.myapplication

import android.app.PendingIntent
import android.app.ProgressDialog
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class AuthentificationNFC : AppCompatActivity() {

    private lateinit var nfcAdapter: NfcAdapter
    private lateinit var pendingIntent: PendingIntent
    private lateinit var intentFiltersArray: Array<IntentFilter>
    private lateinit var timeoutHandler: Handler
    private lateinit var progressDialog: ProgressDialog
    private var isNfcScanEnabled = false
    private val timeoutMillis: Long = 30000 // 30 seconds

    private val timeoutRunnable = Runnable {
        cancelNfcScan()
        Toast.makeText(this@AuthentificationNFC, "Timeout lors de la lecture du tag NFC.", Toast.LENGTH_SHORT).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_authentification_nfc)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.authentificationNfc)) { v, insets ->
            v.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            insets
        }

        progressDialog = ProgressDialog(this)
        progressDialog.setMessage("Chargement...")
        progressDialog.isIndeterminate = true
        progressDialog.setCancelable(false)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null) {
            Log.e("NFC", "NFC n'est pas disponible sur cet appareil.")
            Toast.makeText(this, "NFC n'est pas disponible sur cet appareil.", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT
        )

        val ndef = IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED).apply {
            try {
                addDataType("*/*")
            } catch (e: IntentFilter.MalformedMimeTypeException) {
                Log.e("NFC", "Erreur de type MIME.", e)
            }
        }
        intentFiltersArray = arrayOf(ndef)

        val scanNfcButton = findViewById<Button>(R.id.btn_scan_nfc)
        scanNfcButton.setOnClickListener {
            startNfcScan()
        }

        val cancelButton = findViewById<TextView>(R.id.CancelNfT)
        cancelButton.setOnClickListener {
            clearPreferencesAndLogout()
        }

        timeoutHandler = Handler()
    }

    override fun onResume() {
        super.onResume()
        if (isNfcScanEnabled) {
            nfcAdapter.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, null)
        }
    }

    private fun startNfcScan() {
        if (!isNfcScanEnabled) {
            progressDialog.show()
            nfcAdapter.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, null)
            isNfcScanEnabled = true
            timeoutHandler.postDelayed(timeoutRunnable, timeoutMillis)
            Log.i("MyLog", "Le scan NFC a été lancé.")
        }
    }

    private fun clearPreferencesAndLogout() {
        val sharedPreferences = getSharedPreferences("MyAppPreferences", MODE_PRIVATE)
        with(sharedPreferences.edit()) {
            clear()
            apply()
        }
        val intent = Intent(this@AuthentificationNFC, MainActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun cancelNfcScan() {
        if (isNfcScanEnabled) {
            try {
                nfcAdapter?.disableForegroundDispatch(this)
                isNfcScanEnabled = false
                progressDialog.dismiss()
                timeoutHandler.removeCallbacks(timeoutRunnable)
                Log.i("MyLog", "Le scan NFC a été annulé.")
            } catch (e: IllegalStateException) {
                // Handle exception if necessary
                Log.e("MyLog", "Error disabling NFC foreground dispatch", e)
            }
        }
    }


    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        if (isNfcScanEnabled && intent?.action == NfcAdapter.ACTION_NDEF_DISCOVERED) {
            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            tag?.let {
                handleNfcTag(it)
            }
        }
    }

    private fun handleNfcTag(tag: Tag) {
        try {
            val ndef = Ndef.get(tag)
            ndef?.connect()
            val messages = ndef?.ndefMessage
            ndef?.close()
            Log.d("MyLog2", "Encour")
            Log.d("MyLog2", messages.toString())

            messages?.let {
                val payload = it.records.firstOrNull()?.payload
                val tagContent = payload?.toString(Charsets.UTF_8)

                Log.d("MyLog2", payload.toString())
                Log.d("MyLog2", tagContent.toString())

                if (tagContent?.contains("32dbdfd31df34f803880c0076e8dc8f0b723695cedd51bf951daa8773db6cfd6", ignoreCase = true) == true) {
                    Log.d("MyLog", "Tag NFC correct.")
                    Toast.makeText(this@AuthentificationNFC, "Tag NFC correct.", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, ListLodging::class.java)
                    startActivity(intent)
                } else {
                    Log.e("MyLog", "Tag NFC incorrect.")
                    Toast.makeText(this@AuthentificationNFC, "Tag NFC incorrect.", Toast.LENGTH_SHORT).show()
                }
            } ?: run {
                Log.e("MyLog", "Aucun message NDEF trouvé sur le tag.")
                Toast.makeText(this@AuthentificationNFC, "Aucun message NDEF trouvé sur le tag.", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Log.e("MyLog", "Erreur lors de la lecture du tag NFC.", e)
            Toast.makeText(this@AuthentificationNFC, "Erreur lors de la lecture du tag NFC", Toast.LENGTH_SHORT).show()
        } finally {
            cancelNfcScan()
        }
    }
}
