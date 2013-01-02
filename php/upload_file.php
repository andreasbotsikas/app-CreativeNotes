<?php
    $mJson = $_POST['sendform'];
	$phpJson = json_decode($mJson,true);
	
	if ($phpJson == NULL){
		die("Empty Request!");
	}
	
	$UploadDir = $phpJson['path'];
	$NumIdea = $phpJson['numIdea'];
	$NumPrueba = $phpJson['numPrueba'];
	$Nombre =  $phpJson['nombre'];
	$Texto =  $phpJson['texto'];
	
	//Storage paths
	$UploadDirIdea = $UploadDir . "idea_" . $NumIdea . "/";
	$UploadDirTest = $UploadDir . "idea_" . $NumIdea . "/prueba_" . $NumPrueba . "/";
	
	// if folder already exists we must check index.txt file and increment its value by 1
	// Otherwise we create a new folder with a new index.txt file set to 1
	
	// Folde check and upadte of indexes
	if (!file_exists($UploadDirIdea))
	{
		// Folder path create of Idea
		if (!mkdir($UploadDirIdea, 0, true))
		{
			die('Failed to create folders: ' . $UploadDirIdea);
		}
		// index.txt file from root directory must be incremented by 1
		$FileName = "index.txt";
		$FileName = $UploadDir . $FileName;
		$FileHandle = fopen($FileName, 'rw') or die("can't open file");
		$read = fread($FileHandle, 100);
		$read = $read + 1;
		fwrite($FileHandle, $read);
		fclose($FileHandle);
		
		// since it didnt exist we now have to create a prueba folder as well
		// Folder path create of Prueba
		if (!mkdir($UploadDirTest, 0, true))
		{
			die('Failed to create folders: ' . $UploadDirTest);
		}
		
		// index.txt file from root directory must be created and set to 1
		
		$FileName = "index.txt";
		$FileName = $UploadDirIdea . $FileName;
		$FileHandle = fopen($FileName, 'w') or die("can't open file");
		fwrite($FileHandle, "1");
		fclose($FileHandle);
		
	}
	else
	{
		// Folder Idea already exists, if prueba does not exist we create it and increment index.txt
		if (!file_exists($UploadDirTest))
		{
			if (!mkdir($UploadDirTest, 0, true))
			{
				die('Failed to create folders: ' . $UploadDirTest);
			}
			$FileName = "index.txt";
			$FileName = $UploadDirTest . $FileName;
			$FileHandle = fopen($FileName, 'w') or die("can't open file");
			fwrite($FileHandle, "1");
			fclose($FileHandle);
		}
		else
		{
			//prueba folder exists, so we just increment index.txt value by 1
			$FileName = "index.txt";
			$FileName = $UploadDirTest . $FileName;
			$FileHandle = fopen($FileName, 'rw') or die("can't open file");
			$read = fread($FileHandle, 100);
			$read = $read + 1;
			fwrite($FileHandle, $read);
			fclose($FileHandle);
		}
	}
	
	// Finally, we store the new idea + test info into the desired path folder
	$FileName = $Nombre . "_" . $NumIdea . "_" . $NumPrueba . ".txt";
	$FileName = $UploadDirTest . $FileName;
	$FileHandle = fopen($FileName, 'w') or die("can't open file");
	fwrite($FileHandle, $Texto);
	fclose($FileHandle);
		


		
?>