<?php
$fname = "file.txt";  // default filename

if (!isset($_FILES["file"])) {
  echo "Error:  you must provide a file as a file upload.";
}
else {
  if ($_FILES["file"]["error"] > 0) {
    echo "Error: " . $_FILES["file"]["error"] . "<br />";
  }
  else {
    if (isset($_FILES["file"]["name"])) {
      $fname = $_FILES["file"]["name"];
    } else {
      $fname = "tmpfile.txt";
    }
    
    $target_path = "uploads/";
    
    $target_path = $target_path . $fname; 
    
    $gpxData = file_get_contents($_FILES['file']['tmp_name'], false))
  }
}
  ?>