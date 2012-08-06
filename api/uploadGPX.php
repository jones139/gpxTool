<?php
include("APIConfig.php");
include("dbconn.php");
if (isset($_POST['debug'])) 
  $debug=true; 
else
  $debug=false;
#$debug=true;

$msg="Debug Messages...";
if (isset($_POST['gpxNo'])) {
  if (!empty($gpxNo)) {
    $msg = $msg." found gpxNo...";
    $gpxNo = $_POST['gpxNo'];
  }
}
if (isset($_POST['gpxData'])) {
  $msg=$msg." found gpxData....";
  $gpxData = $_POST['gpxData'];
} else {
  $msg = $msg." no post data - looking for a file...";
  if (!isset($_FILES["file"])) {
    $msg = $msg . " Error:  you must provide a file as a file upload.";
  }
  else {
    if ($_FILES["file"]["error"] > 0) {
      $msg = $msg . " Error: " . $_FILES["file"]["error"] . "<br />";
    }
    else {
      $gpxData = file_get_contents($_FILES['file']['tmp_name'],false);
    }
  }
}
if (!isset($gpxData)) {
  $msg = $msg . " Error - you must provide GPX data as either a file upload or as POST data.";
} else {
  try {
    $msg = $msg . " phew - found some gpxData.....";
    $nowStr = gmDate("Y-m-d H:i:s");

    $title="Default Title";
    $userNo = 0;
    $minLat=360.0;
    $minLon=360.0;
    $maxLat=-180.0;
    $maxLon=-180.0;
    $track=0;
    $route=0;
    $waypts=0;


    $xml = new SimpleXMLElement($gpxData);
    $msg = $msg . $xml->getName() . "<br />";
    
    foreach($xml->children() as $child)
      {
	$msg = $msg . $child->getName() . ": " . $child . "<br />";
	switch ($child->getName()) {
	case "gpx":
	  $msg = $msg . "found gpx<br/>";
	  break;
	case 'trk':
	  $msg = $msg . "found trk<br/>";
	  $track = 1;
	  $title = $child->name;
	  foreach($child->children() as $trkElem)
	    {
	      if ($trkElem->getName()=="trkseg") {
		foreach ($trkElem->children() as $trkPt) {
		  $lat = floatval($trkPt->attributes()->lat);
		  $lon = floatval($trkPt->attributes()->lon);
		  if ($lat < $minLat) { $minLat = $lat; }
		  if ($lat > $maxLat) { $maxLat = $lat; }
		  if ($lon < $minLon) { $minLon = $lon; }
		  if ($lon > $maxLon) { $maxLon = $lon; }
		  //echo "found trkseg->".$trkPt->getName().": lat=".$lat.", lon=".$lon."<br/>";
		}
	      }
	    }
	  break;
	case 'rte':
	  $msg = $msg . "found route<br/>";
	  break;
	case 'waypt':
	  $msg = $msg . "found waypt<br/>";
	  break;
	default:
	  $msg = $msg .  "unknown gpx element "+$child->get_name()."<br/>";
	  
	}
      }
    
  
    if (isset($gpxNo)) {
      $query  = "update gpxFiles (title, userNo, minLat, minLon, maxLat,maxLon,"
	. "track,route,waypts,date,gpxData) values "
	. "( '".$title."', ".$userNo.", " 
	. $minLat.", ".$minLon.", "
	. $maxLat.", ".$maxLon.", "
	. $track.", ".$route.", ".$waypts.","
	. "'".$nowStr."',"
	. "'".$gpxData."'" 
	.") where gpxNo=".$gpxNo.";";
      $msg = $msg . $query;
    } else {
      $query  = "insert into gpxFiles (title, userNo, minLat, minLon, maxLat,maxLon,"
	. "track,route,waypts,date,gpxData) values "
	. "( '".$title."', ".$userNo.", " 
	. $minLat.", ".$minLon.", "
	. $maxLat.", ".$maxLon.", "
	. $track.", ".$route.", ".$waypts.","
	. "'".$nowStr."',"
	. "'".$gpxData."'" 
	.");";
      $msg = $msg . $query;    
    }
  
    $result = mysql_query($query) 
      or $msg = $msg . ' Query failed: ' . mysql_error();
    #or die('Query failed: ' . mysql_error());


    $jobNo=mysql_insert_id();
    
    $msg = $msg . " Job No = " . $jobNo;  

  } catch (Exception $e) {
    $msg = $msg . "****ERROR - SOMETHING WENT WRONG - ".$e;
    $jobNo = -1;
  }  

}
#print $msg;
$dataObject = array();
if ($debug)
  $dataObject['debugMsg']=$msg;

$dataObject['jobNo']=$jobNo;

print "<html><body><textarea>".json_encode($dataObject)."</textarea></body></html>";
#print json_encode($dataObject);


?>
