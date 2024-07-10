package com.example.myapplication

class Service {
    constructor(
        service_id: Int,
        name_service: String?,
        description: String?,
        price: Int,
    ){
        this.service_id = service_id
        if (name_service != null) {
            this.name_service = name_service
        }
        if (description != null) {
            this.description = description
        }
        this.price = price
    }

    var service_id = -1
    var name_service = ""
    var description = ""
    var price = 0
}