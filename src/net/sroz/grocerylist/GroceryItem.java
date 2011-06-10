package net.sroz.grocerylist;

import android.database.Cursor;

public class GroceryItem {
	public int id;
	public String text;
	public boolean checked;
		
	public GroceryItem(Cursor c) {
		id = c.getInt(c.getColumnIndex(GroceryProvider.KEY_ROWID));
		text = c.getString(c.getColumnIndex(GroceryProvider.KEY_TEXT));
		checked = (c.getInt(c.getColumnIndex(GroceryProvider.KEY_CHECKED)) == 1);
	}
}
