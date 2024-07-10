import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import com.example.myapplication.R
import com.example.myapplication.Service

class ServiceAdapter(context: Context, ListService: MutableList<Service>) : BaseAdapter() {
    private val context: Context = context
    private val listService: MutableList<Service> = ListService

    override fun getCount(): Int {
        return listService.size
    }

    override fun getItem(position: Int): Any {
        return listService[position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var view = convertView
        val viewHolder: ViewHolder

        if (view == null) {
            view = LayoutInflater.from(context).inflate(R.layout.row_service, parent, false)
            viewHolder = ViewHolder(view)
            view.tag = viewHolder
        } else {
            viewHolder = view.tag as ViewHolder
        }

        val currentService = getItem(position) as Service
        viewHolder.bind(currentService)

        return view!!
    }

    private class ViewHolder(view: View) {
        private val serviceNameTextView: TextView = view.findViewById(R.id.row_service_text)
        private val serviceDescriptionTextView: TextView = view.findViewById(R.id.row_service_description)

        fun bind(service: Service) {
            serviceNameTextView.text = service.name_service
            serviceDescriptionTextView.text = service.description
        }
    }
}
