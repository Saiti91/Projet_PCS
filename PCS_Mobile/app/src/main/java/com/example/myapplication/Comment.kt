package com.example.myapplication

class Comment {

    constructor(
        note_id: Int,
        note: Int,
        content: String,
        lodging_id: Int,
        user_id: Int,
        date: String,
        count_like: Int,
        reponse_note_id: Int?,
        lastname: String,
        firstname: String
    ) {
        this.note_id = note_id
        this.note = note
        this.content = content
        this.lodging_id = lodging_id
        this.user_id = user_id
        this.date = date
        this.count_like = count_like
        if (reponse_note_id != null) {
            this.reponse_note_id = reponse_note_id
        }
        this.lastname = lastname
        this.firstname = firstname
    }

    var note_id = -1
    var note = 0
    var content = ""
    var lodging_id = -1
    var user_id = -1
    var date = ""
    var count_like = 0
    var reponse_note_id = -1
    var lastname = ""
    var firstname = ""
}