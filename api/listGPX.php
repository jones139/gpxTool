<?php
include("APIConfig.php");
include("dbconn.php");
$query  = "select gpxNo,userNo,title,minLat,minLon,maxLat,maxLon,track,route,waypts,date from gpxFiles";
$result = mysql_query($query) 
  or die('Query failed: ' . mysql_error());
$rows=array();
while($r = mysql_fetch_assoc($result)) {
  $rows[] = $r;
}
print json_encode($rows);  
?>
