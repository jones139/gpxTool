<?php
include("APIConfig.php");
include("dbconn.php");
if (isset($_POST['gpxNo'])) {
  if (!empty($gpxNo)) {
    print "found gpxNo...";
    $gpxNo = $_POST['gpxNo'];
  }
}
if (isset($_POST['gpxData'])) {
  print "found gpxData....";
  $gpxData = $_POST['gpxData'];
} else {
  print "no post data - looking for a file...";
  if (!isset($_FILES["file"])) {
    echo "Error:  you must provide a file as a file upload.";
  }
  else {
    if ($_FILES["file"]["error"] > 0) {
      echo "Error: " . $_FILES["file"]["error"] . "<br />";
    }
    else {
      $gpxData = file_get_contents($_FILES['file']['tmp_name'],false);
    }
  }
}
if (!isset($gpxData)) {
  print "Error - you must provide GPX data as either a file upload or as POST data.";
} else {
  print ("phew - found some gpxData.....");
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
  echo $xml->getName() . "<br />";
    
  foreach($xml->children() as $child)
    {
      echo $child->getName() . ": " . $child . "<br />";
      switch ($child->getName()) {
      case "gpx":
	echo "found gpx<br/>";
	break;
      case 'trk':
	echo "found trk<br/>";
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
	echo "found route<br/>";
	break;
      case 'waypt':
	echo "found waypt<br/>";
	break;
      default:
	echo "unknown gpx element "+$child->get_name()."<br/>";
	
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
    print $query;
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
    print $query;    
  }
  
  $result = mysql_query($query) 
    or die('Query failed: ' . mysql_error());
  
  $jobNo=mysql_insert_id();
  
  print $jobNo;
  
}

?>
