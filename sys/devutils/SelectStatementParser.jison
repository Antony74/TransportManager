/* Parses a restricted subset of SQL which the Transport Manager actually uses                        */
/* as there are other SQL expressions we would prefer the database to not somehow end up executing(!) */

/* lexical grammar */
%lex
%%

\s+			/* skip whitespace */
"select"	return 'SELECT'
"from"		return 'FROM'
"order"		return 'ORDER'
"by"		return 'BY'
"asc"		return 'ASC'
"desc"		return 'DESC'

"a"|"abort"|"abs"|"absolute"|"access"|"action"|"ada"|"add"|"admin"|"after"|"aggregate"|"alias"|"all"|"allocate"|"also"|"alter"|"always"|"analyse"|"analyze"|"and"|"any"|"are"		return 'RESERVED'
"array"|"as"|"asc"|"asensitive"|"assertion"|"assignment"|"asymmetric"|"at"|"atomic"|"attribute"|"attributes"|"audit"|"authorization"|"auto_increment"|"avg"|"avg_row_length"		return 'RESERVED'
"backup"|"backward"|"before"|"begin"|"bernoulli"|"between"|"bigint"|"binary"|"bit"|"bit_length"|"bitvar"|"blob"|"bool"|"boolean"|"both"|"breadth"|"break"|"browse"|"bulk"|"by"		return 'RESERVED'
"c"|"cache"|"call"|"called"|"cardinality"|"cascade"|"cascaded"|"case"|"cast"|"catalog"|"catalog_name"|"ceil"|"ceiling"|"chain"|"change"|"char"|"char_length"|"character"			return 'RESERVED'
"character_length"|"character_set_catalog"|"character_set_name"|"character_set_schema"|"characteristics"|"characters"|"check"|"checked"|"checkpoint"|"checksum"|"class"				return 'RESERVED'
"class_origin"|"clob"|"close"|"cluster"|"clustered"|"coalesce"|"cobol"|"collate"|"collation"|"collation_catalog"|"collation_name"|"collation_schema"|"collect"|"column"				return 'RESERVED'
"column_name"|"columns"|"command_function"|"command_function_code"|"comment"|"commit"|"committed"|"completion"|"compress"|"compute"|"condition"|"condition_number"|"connect"		return 'RESERVED'
"connection"|"connection_name"|"constraint"|"constraint_catalog"|"constraint_name"|"constraint_schema"|"constraints"|"constructor"|"contains"|"containstable"|"continue"			return 'RESERVED'
"conversion"|"convert"|"copy"|"corr"|"corresponding"|"count"|"covar_pop"|"covar_samp"|"create"|"createdb"|"createrole"|"createuser"|"cross"|"csv"|"cube"|"cume_dist"|"current"		return 'RESERVED'
"current_date"|"current_default_transform_group"|"current_path"|"current_role"|"current_time"|"current_timestamp"|"current_transform_group_for_type"|"current_user"|"cursor"		return 'RESERVED'
"cursor_name"|"cycle"|"data"|"database"|"databases"|"date"|"datetime"|"datetime_interval_code"|"datetime_interval_precision"|"day"|"day_hour"|"day_microsecond"|"day_minute"		return 'RESERVED'
"day_second"|"dayofmonth"|"dayofweek"|"dayofyear"|"dbcc"|"deallocate"|"dec"|"decimal"|"declare"|"default"|"defaults"|"deferrable"|"deferred"|"defined"|"definer"|"degree"			return 'RESERVED'
"delay_key_write"|"delayed"|"delete"|"delimiter"|"delimiters"|"dense_rank"|"deny"|"depth"|"deref"|"derived"|"desc"|"describe"|"descriptor"|"destroy"|"destructor"|"deterministic"	return 'RESERVED'
"diagnostics"|"dictionary"|"disable"|"disconnect"|"disk"|"dispatch"|"distinct"|"distinctrow"|"distributed"|"div"|"do"|"domain"|"double"|"drop"|"dual"|"dummy"|"dump"|"dynamic"		return 'RESERVED'
"dynamic_function"|"dynamic_function_code"|"each"|"element"|"else"|"elseif"|"enable"|"enclosed"|"encoding"|"encrypted"|"end"|"end-exec"|"enum"|"equals"|"errlvl"|"escape"|"escaped" return 'RESERVED'
"every"|"except"|"exception"|"exclude"|"excluding"|"exclusive"|"exec"|"execute"|"existing"|"exists"|"exit"|"exp"|"explain"|"external"|"extract"|"false"|"fetch"|"fields"|"file"		return 'RESERVED'
"fillfactor"|"filter"|"final"|"first"|"float"|"float4"|"float8"|"floor"|"flush"|"following"|"for"|"force"|"foreign"|"fortran"|"forward"|"found"|"free"|"freetext"|"freetexttable"	return 'RESERVED'
"freeze"|"from"|"full"|"fulltext"|"function"|"fusion"|"g"|"general"|"generated"|"get"|"global"|"go"|"goto"|"grant"|"granted"|"grants"|"greatest"|"group"|"grouping"|"handler"		return 'RESERVED'
"having"|"header"|"heap"|"hierarchy"|"high_priority"|"hold"|"holdlock"|"host"|"hosts"|"hour"|"hour_microsecond"|"hour_minute"|"hour_second"|"identified"|"identity"					return 'RESERVED'
"identity_insert"|"identitycol"|"if"|"ignore"|"ilike"|"immediate"|"immutable"|"implementation"|"implicit"|"in"|"include"|"including"|"increment"|"index"|"indicator"|"infile"		return 'RESERVED'
"infix"|"inherit"|"inherits"|"initial"|"initialize"|"initially"|"inner"|"inout"|"input"|"insensitive"|"insert"|"insert_id"|"instance"|"instantiable"|"instead"|"int"|"int1"|"int2"	return 'RESERVED'
"int3"|"int4"|"int8"|"integer"|"intersect"|"intersection"|"interval"|"into"|"invoker"|"is"|"isam"|"isnull"|"isolation"|"iterate"|"join"|"k"|"key"|"key_member"|"key_type"|"keys"	return 'RESERVED'
"kill"|"lancompiler"|"language"|"large"|"last"|"last_insert_id"|"lateral"|"leading"|"least"|"leave"|"left"|"length"|"less"|"level"|"like"|"limit"|"lineno"|"lines"|"listen"|"ln"	return 'RESERVED'
"load"|"local"|"localtime"|"localtimestamp"|"location"|"locator"|"lock"|"login"|"logs"|"long"|"longblob"|"longtext"|"loop"|"low_priority"|"lower"|"m"|"map"|"match"|"matched"|"max" return 'RESERVED'
"max_rows"|"maxextents"|"maxvalue"|"mediumblob"|"mediumint"|"mediumtext"|"member"|"merge"|"message_length"|"message_octet_length"|"message_text"|"method"|"middleint"|"min"			return 'RESERVED'
"min_rows"|"minus"|"minute"|"minute_microsecond"|"minute_second"|"minvalue"|"mlslabel"|"mod"|"mode"|"modifies"|"modify"|"module"|"month"|"monthname"|"more"|"move"|"multiset"		return 'RESERVED'
"mumps"|"myisam"|"name"|"names"|"national"|"natural"|"nchar"|"nclob"|"nesting"|"new"|"next"|"no"|"no_write_to_binlog"|"noaudit"|"nocheck"|"nocompress"|"nocreatedb"|"nocreaterole"	return 'RESERVED'
"nocreateuser"|"noinherit"|"nologin"|"nonclustered"|"none"|"normalize"|"normalized"|"nosuperuser"|"not"|"nothing"|"notify"|"notnull"|"nowait"|"null"|"nullable"|"nullif"|"nulls"	return 'RESERVED'
"number"|"numeric"|"object"|"octet_length"|"octets"|"of"|"off"|"offline"|"offset"|"offsets"|"oids"|"old"|"on"|"online"|"only"|"open"|"opendatasource"|"openquery"|"openrowset"		return 'RESERVED'
"openxml"|"operation"|"operator"|"optimize"|"option"|"optionally"|"options"|"or"|"order"|"ordering"|"ordinality"|"others"|"out"|"outer"|"outfile"|"output"|"over"|"overlaps"		return 'RESERVED'
"overlay"|"overriding"|"owner"|"pack_keys"|"pad"|"parameter"|"parameter_mode"|"parameter_name"|"parameter_ordinal_position"|"parameter_specific_catalog"|"parameter_specific_name"	return 'RESERVED'
"parameter_specific_schema"|"parameters"|"partial"|"partition"|"pascal"|"password"|"path"|"pctfree"|"percent"|"percent_rank"|"percentile_cont"|"percentile_disc"|"placing"|"plan"	return 'RESERVED'
"pli"|"position"|"postfix"|"power"|"preceding"|"precision"|"prefix"|"preorder"|"prepare"|"prepared"|"preserve"|"primary"|"print"|"prior"|"privileges"|"proc"|"procedural"			return 'RESERVED'
"procedure"|"process"|"processlist"|"public"|"purge"|"quote"|"raid0"|"raiserror"|"range"|"rank"|"raw"|"read"|"reads"|"readtext"|"real"|"recheck"|"reconfigure"|"recursive"|"ref"	return 'RESERVED'
"references"|"referencing"|"regexp"|"regr_avgx"|"regr_avgy"|"regr_count"|"regr_intercept"|"regr_r2"|"regr_slope"|"regr_sxx"|"regr_sxy"|"regr_syy"|"reindex"|"relative"|"release"	return 'RESERVED'
"reload"|"rename"|"repeat"|"repeatable"|"replace"|"replication"|"require"|"reset"|"resignal"|"resource"|"restart"|"restore"|"restrict"|"result"|"return"|"returned_cardinality"		return 'RESERVED'
"returned_length"|"returned_octet_length"|"returned_sqlstate"|"returns"|"revoke"|"right"|"rlike"|"role"|"rollback"|"rollup"|"routine"|"routine_catalog"|"routine_name"				return 'RESERVED'
"routine_schema"|"row"|"row_count"|"row_number"|"rowcount"|"rowguidcol"|"rowid"|"rownum"|"rows"|"rule"|"save"|"savepoint"|"scale"|"schema"|"schema_name"|"schemas"|"scope"			return 'RESERVED'
"scope_catalog"|"scope_name"|"scope_schema"|"scroll"|"search"|"second"|"second_microsecond"|"section"|"security"|"select"|"self"|"sensitive"|"separator"|"sequence"|"serializable"	return 'RESERVED'
"server_name"|"session"|"session_user"|"set"|"setof"|"sets"|"setuser"|"share"|"show"|"shutdown"|"signal"|"similar"|"simple"|"size"|"smallint"|"some"|"soname"|"source"|"space"		return 'RESERVED'
"spatial"|"specific"|"specific_name"|"specifictype"|"sql"|"sql_big_result"|"sql_big_selects"|"sql_big_tables"|"sql_calc_found_rows"|"sql_log_off"|"sql_log_update"					return 'RESERVED'
"sql_low_priority_updates"|"sql_select_limit"|"sql_small_result"|"sql_warnings"|"sqlca"|"sqlcode"|"sqlerror"|"sqlexception"|"sqlstate"|"sqlwarning"|"sqrt"|"ssl"|"stable"|"start"	return 'RESERVED'
"starting"|"state"|"statement"|"static"|"statistics"|"status"|"stddev_pop"|"stddev_samp"|"stdin"|"stdout"|"storage"|"straight_join"|"strict"|"string"|"structure"|"style"			return 'RESERVED'
"subclass_origin"|"sublist"|"submultiset"|"substring"|"successful"|"sum"|"superuser"|"symmetric"|"synonym"|"sysdate"|"sysid"|"system"|"system_user"|"table"|"table_name"|"tables"	return 'RESERVED'
"tablesample"|"tablespace"|"temp"|"template"|"temporary"|"terminate"|"terminated"|"text"|"textsize"|"than"|"then"|"ties"|"time"|"timestamp"|"timezone_hour"|"timezone_minute"		return 'RESERVED'
"tinyblob"|"tinyint"|"tinytext"|"to"|"toast"|"top"|"top_level_count"|"trailing"|"tran"|"transaction"|"transaction_active"|"transactions_committed"|"transactions_rolled_back"		return 'RESERVED'
"transform"|"transforms"|"translate"|"translation"|"treat"|"trigger"|"trigger_catalog"|"trigger_name"|"trigger_schema"|"trim"|"true"|"truncate"|"trusted"|"tsequal"|"type"			return 'RESERVED'
"uescape"|"uid"|"unbounded"|"uncommitted"|"under"|"undo"|"unencrypted"|"union"|"unique"|"unknown"|"unlisten"|"unlock"|"unnamed"|"unnest"|"unsigned"|"until"|"update"|"updatetext"	return 'RESERVED'
"upper"|"usage"|"use"|"user"|"user_defined_type_catalog"|"user_defined_type_code"|"user_defined_type_name"|"user_defined_type_schema"|"using"|"utc_date"|"utc_time"|"utc_timestamp" return 'RESERVED'
"vacuum"|"valid"|"validate"|"validator"|"value"|"values"|"var_pop"|"var_samp"|"varbinary"|"varchar"|"varchar2"|"varcharacter"|"variable"|"variables"|"varying"|"verbose"|"view"		return 'RESERVED'
"volatile"|"waitfor"|"when"|"whenever"|"where"|"while"|"width_bucket"|"window"|"with"|"within"|"without"|"work"|"write"|"writetext"|"x509"|"xor"|"year"|"year_month"				return 'RESERVED'
"zerofill"|"zone"																																									return 'RESERVED'

[a-z]([a-z]|[0-9])*		return 'NAME'
'*'						return 'ASTERISK'
<<EOF>>					return 'EOF'
.						return 'INVALID'

/lex

%start query

%% /* language grammar */

query      : SELECT names FROM NAME orderby EOF;

names      : NAME
	       | ASTERISK
	       | names ',' NAME;

orderby    :
		   | ORDER BY ordernames;

ordernames : NAME direction
		   | ordernames ',' NAME direction;

direction  :
		   | ASC
		   | DESC;
