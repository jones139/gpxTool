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
    
    if(move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
      echo "<a href='".$target_path."'>link</a>";
      } else{
	echo "There was an error uploading the file, please try again!";
      }
  }
}
  ?>