package net.sroz.helloworld;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.UriMatcher;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteQueryBuilder;
import android.net.Uri;
import android.util.Log;

public class GroceryProvider extends ContentProvider {
	private static final int ITEMS = 1;
	private static final int ITEMS_ID = 2;
	
	public static final String KEY_ROWID = "_id";
	public static final String KEY_ITEM = "Item";
	public static final String KEY_CHECKED = "Checked";
	
	private static final String TAG = "DBAdapter";
	
	public static final String DATABASE_NAME = "GroceryList.db";
	public static final String DATABASE_TABLE = "tblGroceries";
	public static final int DATABASE_VERSION = 1;
	
	private static final String DATABASE_CREATE =
		"create table tblGroceries ("
		+ "_id integer primary key autoincrement, "
		+ "Item text not null, "
		+ "Checked integer not null"
		+ ");";
	
	private DatabaseHelper DBHelper;
	private static final UriMatcher sURLMatcher = new UriMatcher(UriMatcher.NO_MATCH);
	
	static {
		sURLMatcher.addURI("net.sroz.helloworld", "item", ITEMS);
		sURLMatcher.addURI("net.sroz.helloworld", "item/#", ITEMS_ID);
	}
	
	
	private static class DatabaseHelper extends SQLiteOpenHelper {
		DatabaseHelper(Context c) {
			super(c, DATABASE_NAME, null, DATABASE_VERSION);
		}
		
		@Override
		public void onCreate(SQLiteDatabase db) {
			db.execSQL(DATABASE_CREATE);
		}
		
		@Override
		public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
			Log.w(TAG, "Upgrading database from version " + oldVersion + " to " + newVersion + ", which will destroy all old data");
			db.execSQL("DROP TABLE IF EXISTS tblGroceries;");
			onCreate(db);
		}
	}
	
	public GroceryProvider() {
	}
	
	public GroceryProvider open() throws SQLException {
		db = DBHelper.getWritableDatabase();
		return this;
	}
	
	public void close() {
		DBHelper.close();
	}

	public long insertItem(String item) {
		ContentValues initialValues = new ContentValues();
		initialValues.put(KEY_ITEM, item);
		initialValues.put(KEY_CHECKED, false);
		return db.insert(DATABASE_TABLE, null, initialValues);
	}
	
	
	@Override
	public int delete(Uri uri, String selection, String[] selectionArgs) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public String getType(Uri uri) {
		int match = sURLMatcher.match(uri);
		switch (match) {
			case ITEMS:
				return "vnd.sroz.cursor.dir/items";
			case ITEMS_ID:
				return "vnd.sroz.cursor.item/items";
			default:
				throw new IllegalArgumentException("Unknown URI");
		}
	}

	@Override
	public Uri insert(Uri uri, ContentValues initialValues) {
		if (sURLMatcher.match(uri) != ITEMS) {
			throw new IllegalArgumentException("Cannot insert into URI: " + uri);
		}
		
		ContentValues values;
		if (initialValues != null)
			values = new ContentValues(initialValues);
		else
			values = new ContentValues();
		
		if (!values.containsKey(KEY_ITEM))
			throw new IllegalArgumentException("Missing required key: KEY_ITEM");
		
		if (!values.containsKey(KEY_CHECKED))
			values.put(KEY_CHECKED, false);
		
		SQLiteDatabase db = DBHelper.getWritableDatabase();
		long rowId = db.insert(DATABASE_TABLE, null, values);
	}

	@Override
	public boolean onCreate() {
		DBHelper = new DatabaseHelper(getContext());
		return true;
	}

	@Override
	public Cursor query(Uri uri, String[] projection, String selection,
			String[] selectionArgs, String sortOrder) {
		SQLiteQueryBuilder qb = new SQLiteQueryBuilder();
		qb.setTables("tblGroceries");
		SQLiteDatabase db = DBHelper.getReadableDatabase();
		Cursor ret = qb.query(db, projection, selection, selectionArgs, null, null, sortOrder);
		if (ret != null) {
			ret.setNotificationUri(getContext().getContentResolver(), uri);
		}
		return ret;
	}

	@Override
	public int update(Uri uri, ContentValues values, String selection,
			String[] selectionArgs) {
		int count;
		long rowId = 0;
		int match = sURLMatcher.match(uri);
		SQLiteDatabase db = DBHelper.getWritableDatabase();
		switch (match) {
			case ITEMS_ID: {
				String segment = uri.getPathSegments().get(1);
				rowId = Long.parseLong(segment);
				count = db.update(DATABASE_TABLE, values, "_id=" + rowId, null);
				break;
			}
			default: {
				throw new UnsupportedOperationException("Cannot update URI: " + uri);
			}
		}
		getContext().getContentResolver().notifyChange(uri, null);
		return count;
	}
}
