<?php
include("APIConfig.php");
include("dbconn.php");
$gpxNo = $_GET['gpxNo'];
$query  = "select gpxData from gpxFiles where gpxNo=".$gpxNo."";
$result = mysql_query($query) 
  or die('Query failed: ' . mysql_error());
if (mysql_num_rows($result)>0) {
  $row = mysql_fetch_assoc($result);
  header("Cache-Control: public");
  header("Content-Description: File Transfer");
  header("Content-Disposition: attachment; filename=getGPX.gpx");
  header("Content-Type: text/xml");
  print $row['gpxData'];
  }
  else {
     print "0";
  }

?>
