<?php 
//////////////////////////////////////////////////////////////
// Setup the databases required by this web interface
//////////////////////////////////////////////////////////////

include("dbconn.php");
include("APIConfig.php");




$sql = "drop table if exists gpxFiles;";
mysql_query($sql,$dbconn)
    or die('Could not connect: ' . mysql_error());


$sql = <<<'EOD'
create table gpxFiles (
       	     	   gpxNo int not null auto_increment, 
                   title varchar(256),
		   minLat float,
		   minLon float,
		   maxLat float,
		   maxLon float,
		   track boolean,
		   route boolean,
		   waypts boolean,
                   date timestamp,
                   gpxData blob,
		   primary key (gpxNo)
);
EOD;

mysql_query($sql,$dbconn)
    or die('Could not connect: ' . mysql_error());


?>
