package net.sroz.helloworld;

import android.app.Activity;
import android.os.Bundle;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemLongClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.AutoCompleteTextView;
import android.widget.TextView;
import android.widget.Toast;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnLongClickListener;


public class HellowWorldActivity extends Activity {
	AutoCompleteTextView tvNewItem;
	Button btnAddItem;
	ListView lvItems;
	static String[] stock_items = new String[] {
		"One",
		"Two",
		"Three"
	};
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        
        tvNewItem = (AutoCompleteTextView)findViewById(R.id.tvNewItem);
        btnAddItem = (Button)findViewById(R.id.btnAddItem);
        lvItems = (ListView)findViewById(R.id.lvItems);
        
        //lvItems.setAdapter(new ArrayAdapter<String>(this, android.R.layout.simple_list_item_multiple_choice, stock_items));
        lvItems.setAdapter(new CursorAdapter(this, cursor));
        
        lvItems.setOnItemLongClickListener(mShowItemOptions);

        btnAddItem.setOnClickListener(mAddListener);
    }
    
    private OnClickListener mAddListener = new OnClickListener()
    {
		public void onClick(View v) {
			Toast.makeText(getApplicationContext(), "onClick", Toast.LENGTH_SHORT).show();
		}
    };
    
    private OnItemLongClickListener mShowItemOptions = new OnItemLongClickListener() {
		public boolean onItemLongClick(AdapterView<?> parent, View v,
				int position, long id) {
			Toast.makeText(getApplicationContext(), "onItemLongClick", Toast.LENGTH_SHORT).show();
			return false;
		}
	};
}