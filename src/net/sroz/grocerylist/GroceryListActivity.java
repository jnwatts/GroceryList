package net.sroz.grocerylist;

import net.sroz.grocerylist.R;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckedTextView;
import android.widget.CursorAdapter;
import android.widget.ListView;
import android.widget.AutoCompleteTextView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnLongClickListener;
import android.view.ViewGroup;


public class GroceryListActivity extends Activity {
	AutoCompleteTextView tvNewItem;
	Button btnAddItem;
	ListView lvItems;
	LayoutInflater mFactory;
	Cursor mCursor;
	
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
        
        mFactory = LayoutInflater.from(this);
        mCursor = getContentResolver().query(GroceryProvider.CONTENT_URI, GroceryProvider.ITEM_QUERY_COLUMNS, null, null, GroceryProvider.DEFAULT_SORT_ORDER);
        
        lvItems.setAdapter(new GroceryListAdapter(this, mCursor));
        
        //lvItems.setOnItemLongClickListener(mShowItemOptions);

        btnAddItem.setOnClickListener(mAddListener);
    }
    
    private OnClickListener mAddListener = new OnClickListener()
    {
		public void onClick(View v) {
			GroceryListActivity.add_item(getApplicationContext(), tvNewItem.getText().toString());
		}
    };
    
	private class GroceryListAdapter extends CursorAdapter {

		public GroceryListAdapter(Context context, Cursor c) {
			super(context, c);
		}

		@Override
		public void bindView(View view, Context context, Cursor cursor) {
			final GroceryItem item = new GroceryItem(cursor);
			CheckedTextView text1 = (CheckedTextView) view.findViewById(android.R.id.text1);
			text1.setText(item.text);
			text1.setChecked(item.checked);
			
			text1.setOnClickListener(new OnClickListener() {
				public void onClick(View v) {
					boolean isChecked = !((CheckedTextView)v).isChecked();
					GroceryListActivity.toggle_item(getApplicationContext(), item.id, isChecked);
				}
			});
			
			
			text1.setLongClickable(true);
			text1.setOnLongClickListener(new OnLongClickListener() {
				public boolean onLongClick(View v) {
					/* XXX Show context menu on long click */
					GroceryListActivity.delete_item(getApplicationContext(), item.id);
					return false;
				}
			});
		}

		@Override
		public View newView(Context context, Cursor cursor, ViewGroup parent) {
			View ret = mFactory.inflate(android.R.layout.simple_list_item_multiple_choice, parent, false);
			/* XXX Do we want to initialize empty/default values?
			CheckedTextView text1 = (CheckedTextView) ret.findViewById(android.R.id.text1);
			text1.setText(cursor.getString(cursor.getColumnIndex(GroceryProvider.KEY_ITEM)));
			text1.setChecked((cursor.getInt(cursor.getColumnIndex(GroceryProvider.KEY_CHECKED)) == 1));
			*/
			return ret;
		}
	}
	
	private static GroceryItem getItem(ContentResolver resolver, int id) {
		Uri uri = ContentUris.withAppendedId(GroceryProvider.CONTENT_URI, id);
		Cursor c = resolver.query(uri, GroceryProvider.ITEM_QUERY_COLUMNS, null, null, null);
		GroceryItem item = null;
		if (c != null) {
			if (c.moveToFirst()) {
				item = new GroceryItem(c);
			}
			c.close();
		}
		return item;
	}

	public static void add_item(Context c, String text) {
		ContentValues values = new ContentValues(1);
		values.put(GroceryProvider.KEY_TEXT, text);
		c.getContentResolver().insert(GroceryProvider.CONTENT_URI, values);	
	}

	public static void delete_item(Context c, int id) {
		Uri uri = ContentUris.withAppendedId(GroceryProvider.CONTENT_URI, id);
		c.getContentResolver().delete(uri, null, null);
	}

	public static void toggle_item(Context c, int id, boolean isChecked) {
		ContentValues values = new ContentValues(1);
		values.put(GroceryProvider.KEY_CHECKED, isChecked ? 1 : 0);
		
		Uri uri = ContentUris.withAppendedId(GroceryProvider.CONTENT_URI, id);
		c.getContentResolver().update(uri, values, null, null);
	}
	

}