
<?php
 $logfile = "log.txt";
 $loghandle = fopen($logfile,"w");
fwrite($loghandle,"ids:  test \n");
if ($_FILES["file"]["error"] > 0)
  {
  echo "Error: " . $_FILES["file"]["error"] . "<br />";
	fwrite($loghandle,"ids: error \n");
  }
else
  {
  	fwrite($loghandle,"ids: done <br />");
  	fwrite($loghandle,"ids: done2 ". "upload/img_" . $_FILES["file"]["name"] . ".jpg" . "<br />");
  move_uploaded_file($_FILES["file"]["tmp_name"], "upload/img_" . $_FILES["file"]["name"]);
	fwrite($loghandle,"ids: done3 <br />");
  }
?>  