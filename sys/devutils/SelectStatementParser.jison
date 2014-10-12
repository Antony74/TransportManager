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

"a"|"c"|"g"|"k"|"m"																																									return 'RESERVED'
"as"|"at"|"by"|"do"|"go"|"if"|"in"|"is"|"ln"|"no"|"of"|"on"|"or"|"to"																												return 'RESERVED'
"abs"|"ada"|"add"|"all"|"and"|"any"|"are"|"asc"|"avg"|"bit"|"csv"|"day"|"dec"|"div"|"end"|"exp"|"for"|"get"|"int"|"key"|"map"														return 'RESERVED'
"max"|"min"|"mod"|"new"|"not"|"off"|"old"|"out"|"pad"|"pli"|"raw"|"ref"|"row"|"set"|"sql"|"ssl"|"sum"|"top"|"uid"|"use"|"xor"														return 'RESERVED'
"also"|"blob"|"bool"|"both"|"bulk"|"call"|"case"|"cast"|"ceil"|"char"|"clob"|"copy"|"corr"|"cube"|"data"|"date"|"dbcc"|"deny"|"desc"|"disk"|"drop"|"dual"|"dump"|"each"|"else"		return 'RESERVED'
"enum"|"exec"|"exit"|"file"|"free"|"from"|"full"|"goto"|"heap"|"hold"|"host"|"hour"|"int1"|"int2"|"int3"|"int4"|"int8"|"into"|"isam"|"join"|"keys"|"kill"|"last"|"left"|"less"		return 'RESERVED'
"like"|"load"|"lock"|"logs"|"long"|"loop"|"mode"|"more"|"move"|"name"|"next"|"none"|"null"|"oids"|"only"|"open"|"over"|"path"|"plan"|"proc"|"rank"|"read"|"real"|"role"|"rows"		return 'RESERVED'
"rule"|"save"|"self"|"sets"|"show"|"size"|"some"|"sqrt"|"temp"|"text"|"than"|"then"|"ties"|"time"|"tran"|"trim"|"true"|"type"|"undo"|"user"|"view"|"when"|"with"|"work"|"x509"		return 'RESERVED'
"year"|"zone"																																										return 'RESERVED'
"abort"|"admin"|"after"|"alias"|"alter"|"array"|"audit"|"begin"|"break"|"cache"|"chain"|"check"|"class"|"close"|"cobol"|"count"|"cross"|"cycle"|"depth"|"deref"|"dummy"|"every"		return 'RESERVED'
"false"|"fetch"|"final"|"first"|"float"|"floor"|"flush"|"force"|"found"|"grant"|"group"|"hosts"|"ilike"|"index"|"infix"|"inner"|"inout"|"input"|"large"|"least"|"leave"|"level"		return 'RESERVED'
"limit"|"lines"|"local"|"login"|"lower"|"match"|"merge"|"minus"|"month"|"mumps"|"names"|"nchar"|"nclob"|"nulls"|"order"|"outer"|"owner"|"power"|"print"|"prior"|"purge"|"quote"		return 'RESERVED'
"raid0"|"range"|"reads"|"reset"|"right"|"rlike"|"rowid"|"scale"|"scope"|"setof"|"share"|"space"|"sqlca"|"start"|"state"|"stdin"|"style"|"sysid"|"table"|"toast"|"treat"|"under"		return 'RESERVED'
"union"|"until"|"upper"|"usage"|"using"|"valid"|"value"|"where"|"while"|"write"																										return 'RESERVED'
"access"|"action"|"always"|"atomic"|"backup"|"before"|"bigint"|"binary"|"bitvar"|"browse"|"called"|"change"|"column"|"commit"|"create"|"cursor"|"degree"|"delete"|"domain"			return 'RESERVED'
"double"|"elseif"|"enable"|"equals"|"errlvl"|"escape"|"except"|"exists"|"fields"|"filter"|"float4"|"float8"|"freeze"|"fusion"|"global"|"grants"|"having"|"header"|"ignore"			return 'RESERVED'
"infile"|"insert"|"isnull"|"length"|"lineno"|"listen"|"member"|"method"|"minute"|"modify"|"module"|"myisam"|"notify"|"nowait"|"nullif"|"number"|"object"|"octets"|"offset"			return 'RESERVED'
"online"|"option"|"others"|"output"|"pascal"|"prefix"|"public"|"regexp"|"reload"|"rename"|"repeat"|"result"|"return"|"revoke"|"rollup"|"rownum"|"schema"|"scroll"|"search"			return 'RESERVED'
"second"|"select"|"signal"|"simple"|"soname"|"source"|"stable"|"static"|"status"|"stdout"|"strict"|"string"|"system"|"tables"|"unique"|"unlock"|"unnest"|"update"|"vacuum"			return 'RESERVED'
"values"|"window"|"within"																																							return 'RESERVED'
"analyse"|"analyze"|"between"|"boolean"|"breadth"|"cascade"|"catalog"|"ceiling"|"checked"|"cluster"|"collate"|"collect"|"columns"|"comment"|"compute"|"connect"|"convert"			return 'RESERVED'
"current"|"decimal"|"declare"|"default"|"defined"|"definer"|"delayed"|"derived"|"destroy"|"disable"|"dynamic"|"element"|"escaped"|"exclude"|"execute"|"explain"|"extract"			return 'RESERVED'
"foreign"|"fortran"|"forward"|"general"|"granted"|"handler"|"include"|"inherit"|"initial"|"instead"|"integer"|"invoker"|"iterate"|"lateral"|"leading"|"locator"|"matched"			return 'RESERVED'
"natural"|"nesting"|"noaudit"|"nocheck"|"nologin"|"nothing"|"notnull"|"numeric"|"offline"|"offsets"|"openxml"|"options"|"outfile"|"overlay"|"partial"|"pctfree"|"percent"			return 'RESERVED'
"placing"|"postfix"|"prepare"|"primary"|"process"|"recheck"|"regr_r2"|"reindex"|"release"|"replace"|"require"|"restart"|"restore"|"returns"|"routine"|"schemas"|"section"			return 'RESERVED'
"session"|"setuser"|"similar"|"spatial"|"sqlcode"|"storage"|"sublist"|"synonym"|"sysdate"|"tinyint"|"trigger"|"trusted"|"tsequal"|"uescape"|"unknown"|"unnamed"|"var_pop"			return 'RESERVED'
"varchar"|"varying"|"verbose"|"waitfor"|"without"																																	return 'RESERVED'
"absolute"|"allocate"|"backward"|"cascaded"|"checksum"|"coalesce"|"compress"|"contains"|"continue"|"createdb"|"database"|"datetime"|"day_hour"|"defaults"|"deferred"|"describe"		return 'RESERVED'
"dispatch"|"distinct"|"enclosed"|"encoding"|"end-exec"|"existing"|"external"|"freetext"|"fulltext"|"function"|"greatest"|"grouping"|"holdlock"|"identity"|"implicit"|"inherits"		return 'RESERVED'
"instance"|"interval"|"key_type"|"language"|"location"|"longblob"|"longtext"|"max_rows"|"maxvalue"|"min_rows"|"minvalue"|"mlslabel"|"modifies"|"multiset"|"national"|"nullable"		return 'RESERVED'
"operator"|"optimize"|"ordering"|"overlaps"|"password"|"position"|"preorder"|"prepared"|"preserve"|"readtext"|"regr_sxx"|"regr_sxy"|"regr_syy"|"relative"|"resignal"|"resource"		return 'RESERVED'
"restrict"|"rollback"|"rowcount"|"security"|"sequence"|"shutdown"|"smallint"|"specific"|"sqlerror"|"sqlstate"|"starting"|"template"|"textsize"|"tinyblob"|"tinytext"|"trailing"		return 'RESERVED'
"truncate"|"unlisten"|"unsigned"|"utc_date"|"utc_time"|"validate"|"var_samp"|"varchar2"|"variable"|"volatile"|"whenever"|"zerofill"													return 'RESERVED'
"aggregate"|"assertion"|"attribute"|"bernoulli"|"character"|"clustered"|"collation"|"committed"|"condition"|"covar_pop"|"cume_dist"|"databases"|"dayofweek"|"dayofyear"				return 'RESERVED'
"delimiter"|"encrypted"|"exception"|"excluding"|"exclusive"|"following"|"generated"|"hierarchy"|"immediate"|"immutable"|"including"|"increment"|"indicator"|"initially"				return 'RESERVED'
"insert_id"|"intersect"|"isolation"|"localtime"|"mediumint"|"middleint"|"monthname"|"noinherit"|"normalize"|"openquery"|"operation"|"pack_keys"|"parameter"|"partition"				return 'RESERVED'
"preceding"|"precision"|"procedure"|"raiserror"|"recursive"|"regr_avgx"|"regr_avgy"|"row_count"|"savepoint"|"sensitive"|"separator"|"statement"|"structure"|"substring"				return 'RESERVED'
"superuser"|"symmetric"|"temporary"|"terminate"|"timestamp"|"transform"|"translate"|"unbounded"|"validator"|"varbinary"|"variables"|"writetext"										return 'RESERVED'
"asensitive"|"assignment"|"asymmetric"|"attributes"|"bit_length"|"characters"|"checkpoint"|"completion"|"connection"|"constraint"|"conversion"|"covar_samp"|"createrole"			return 'RESERVED'
"createuser"|"day_minute"|"day_second"|"dayofmonth"|"deallocate"|"deferrable"|"delimiters"|"dense_rank"|"descriptor"|"destructor"|"dictionary"|"disconnect"|"fillfactor"			return 'RESERVED'
"identified"|"initialize"|"key_member"|"maxextents"|"mediumblob"|"mediumtext"|"nocompress"|"nocreatedb"|"normalized"|"openrowset"|"optionally"|"ordinality"|"overriding"			return 'RESERVED'
"parameters"|"privileges"|"procedural"|"references"|"regr_count"|"regr_slope"|"repeatable"|"row_number"|"rowguidcol"|"scope_name"|"sqlwarning"|"statistics"|"stddev_pop"			return 'RESERVED'
"successful"|"table_name"|"tablespace"|"terminated"|"transforms"|"updatetext"|"year_month"																							return 'RESERVED'
"cardinality"|"char_length"|"column_name"|"constraints"|"constructor"|"cursor_name"|"diagnostics"|"distinctrow"|"distributed"|"hour_minute"|"hour_second"|"identitycol"				return 'RESERVED'
"insensitive"|"lancompiler"|"nosuperuser"|"processlist"|"reconfigure"|"referencing"|"replication"|"schema_name"|"server_name"|"sql_log_off"|"stddev_samp"|"submultiset"				return 'RESERVED'
"system_user"|"tablesample"|"transaction"|"translation"|"uncommitted"|"unencrypted"																									return 'RESERVED'
"catalog_name"|"class_origin"|"current_date"|"current_path"|"current_role"|"current_time"|"current_user"|"instantiable"|"intersection"|"low_priority"|"message_text"|"nocreaterole" return 'RESERVED'
"nocreateuser"|"nonclustered"|"octet_length"|"percent_rank"|"routine_name"|"scope_schema"|"serializable"|"session_user"|"specifictype"|"sql_warnings"|"sqlexception"|"trigger_name" return 'RESERVED'
"varcharacter"|"width_bucket"																																						return 'RESERVED'
"authorization"|"containstable"|"corresponding"|"deterministic"|"freetexttable"|"high_priority"																						return 'RESERVED'
"minute_second""scope_catalog"|"specific_name"|"straight_join"|"timezone_hour"|"utc_timestamp"																						return 'RESERVED'
"auto_increment"|"avg_row_length"|"collation_name"|"implementation"|"last_insert_id"|"localtimestamp"|"message_length"|"opendatasource"												return 'RESERVED'
"parameter_mode"|"parameter_name"|"regr_intercept"|"routine_schema"|"sql_big_result"|"sql_big_tables"|"sql_log_update"|"trigger_schema"												return 'RESERVED'
"characteristics"|"connection_name"|"constraint_name"|"day_microsecond"|"delay_key_write"|"identity_insert"|"percentile_cont"|"percentile_disc"										return 'RESERVED'
"returned_length"|"routine_catalog"|"sql_big_selects"|"subclass_origin"|"timezone_minute"|"top_level_count"|"trigger_catalog"														return 'RESERVED'
"character_length"|"collation_schema"|"command_function"|"condition_number"|"dynamic_function"|"hour_microsecond"|"sql_select_limit"|"sql_small_result"								return 'RESERVED'
"collation_catalog"|"constraint_schema"|"current_timestamp"|"returned_sqlstate"																										return 'RESERVED'
"character_set_name"|"constraint_catalog"|"minute_microsecond"|"no_write_to_binlog"|"second_microsecond"|"transaction_active"														return 'RESERVED'
"sql_calc_found_rows"																																								return 'RESERVED'
"character_set_schema"|"message_octet_length"|"returned_cardinality"																												return 'RESERVED'
"character_set_catalog"|"command_function_code"|"dynamic_function_code"|"returned_octet_length"																						return 'RESERVED'
"datetime_interval_code"|"transactions_committed"|"user_defined_type_code"|"user_defined_type_name"																					return 'RESERVED'
"parameter_specific_name"																																							return 'RESERVED'
"sql_low_priority_updates"|"transactions_rolled_back"|"user_defined_type_schema"																									return 'RESERVED'
"parameter_specific_schema"|"user_defined_type_catalog"																																return 'RESERVED'
"parameter_ordinal_position"|"parameter_specific_catalog"																															return 'RESERVED'
"datetime_interval_precision"																																						return 'RESERVED'
"current_default_transform_group"																																					return 'RESERVED'
"current_transform_group_for_type"																																					return 'RESERVED'

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
