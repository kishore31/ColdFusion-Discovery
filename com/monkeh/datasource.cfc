component client="true" output="false"
{	
	public any function init()
	{
		//clearDatasource(); // TODO: This is just in for testing.
		createDatasource();
		return this;
	}
	
	private any function clearDatasource()
	{
		var q = '';
		var sql = 'drop table tbl_placetypes';
		q = queryExecute(sql, null, {"datasource"="discoverydata"});
	}
	
	public function getAllPlaceTypes() hint="I return all place types from the datasource." output="false"
	{
		var q = '';
		var sql = 'select * from tbl_placetypes order by label ASC';
		q = queryExecute(sql, null, {"datasource"="discoverydata"});
		return q;
	}

	private any function createDatasource() hint="I create the datasource." output="false"
	{
		var q = '';
		var sql = "create table if not exists tbl_placetypes (
							id integer primary key autoincrement,
							label text,
							type text
					)";
		q = queryExecute(sql, null, {"datasource"="discoverydata"});
	}
	
	public any function populateTypeTable(required array data)
	{
		var q = '';
		var sql = '';
		q = getAllPlaceTypes();
		if( q.recordcount != data.len()) {
			sql = "delete from tbl_placetypes";
			q = queryExecute(sql, null, {"datasource"="discoverydata"});
			for(var i = 1; i<data.len(); i++) {
				sql = "insert into tbl_placetypes (label, type) values ('#data[i].label#', '#data[i].type#')";
				queryExecute(sql, null, {"datasource"="discoverydata"});
			}
		}
		return true;
	}
	
	private any function checkdb() {
		q = queryExecute("select * from tbl_placetypes", null, {"datasource"="discoverydata"});
		return q;
	}

}