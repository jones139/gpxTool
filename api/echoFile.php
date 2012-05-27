<?php
//print_r($_POST);
//print_r($_FILES);

$fname = "file.txt";  // default filename

if (!isset($_POST["file"]) && (!isset($_FILES["file"]))) {
  echo "Error:  you must provide a file as either a file upload or POST data";
}
else {
  if (isset($_POST["file"])) {
    //echo "file set in POST data - using that - data="+$data+" fname="+$fname;
    //echo "file="+$_POST["file"];
    if (isset($_POST["fname"])) {
      $fname = $_POST["fname"];
    }
    $data = $_POST["file"];
  }
  elseif (isset($_FILES["file"])) {
    if ($_FILES["file"]["error"] > 0) {
      echo "Error: " . $_FILES["file"]["error"] . "<br />";
    }
    else {
      echo "file is set in FILES - using that";
      $data = file_get_contents($_FILES["file"]["tmp_name"]);
      $fname = $_FILES["file"]["name"];
    }

    if (!isset($data)) {
      echo "error - no data found.....";
    }
    else {
      // Set headers
      //header("Cache-Control: public");
      //header("Content-Description: File Transfer");
      //header("Content-Disposition: attachment; filename=$fname");
      //header("Content-Type: text/html");
      // header("Content-Transfer-Encoding: binary");
      echo "Data = " + $data;
      //echo "Upload: " . $_FILES["file"]["name"] . "<br />";
      //echo "Type: " . $_FILES["file"]["type"] . "<br />";
      //echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
      //echo "Stored in: " . $_FILES["file"]["tmp_name"];
    }
  }
}
?>



