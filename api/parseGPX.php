<?php
$xml = simplexml_load_file("test.xml");
//$xml = simplexml_load_string();

//foreach ($movies->movie[0]->rating as $rating) {
//    switch((string) $rating['type']) { // Get attributes as element indices
//    case 'thumbs':

foreach($xml->children() as $child)
  {
    echo $child->getName() . ": " . $child . "<br />";
  }

?>