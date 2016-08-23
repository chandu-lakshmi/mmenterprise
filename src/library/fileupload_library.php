<?php  
class fileupload_library {
	
	

    private $allowedExtensions = array();
    private $sizeLimit = 18874368;
    private $file;

    function fileUpload($allowedExtensions = array(), $sizeLimit = 18874368){      
        $allowedExtensions = array_map("strtolower", $allowedExtensions);
            
        $this->allowedExtensions = $allowedExtensions;        
        $this->sizeLimit = $sizeLimit;
        
        $this->checkServerSettings();       

        if (isset($_REQUEST['filename'])) {
            $this->file = 1;
        } elseif (isset($_FILES['qqfile'])) {
            $this->file =2;
        } else {
            $this->file = false; 
        }
    }
    
    private function checkServerSettings(){        
        $postSize = $this->toBytes(ini_get('post_max_size'));
        $uploadSize = $this->toBytes(ini_get('upload_max_filesize'));        
		//print $postSize."--".$uploadSize."--". $this->sizeLimit;
        if ($postSize < $this->sizeLimit || $uploadSize < $this->sizeLimit){
            $size = max(1, $this->sizeLimit / 1024 / 1024) . 'M';             
            //die("{'error':'increase post_max_size and upload_max_filesize to $size'}");    
        }        
    }
    
    private function toBytes($str){
        $val = trim($str);
        $last = strtolower($str[strlen($str)-1]);
        switch($last) {
            case 'g': $val *= 1024;
            case 'm': $val *= 1024;
            case 'k': $val *= 1024;        
        }
        return $val;
    }
    
    /**
     * Returns array('success'=>true) or array('error'=>'error message')
     */
    function handleUpload($uploadDirectory, $replaceOldFile = FALSE,$myfilename=''){
        if (!is_writable($uploadDirectory)){
            return array('error' => "Server error. Upload directory isn't writable.");
        }
        
        if (!$this->file){
            return array('error' => 'No files were uploaded.');
        }
        if (isset($_REQUEST['filename'])) {
        	$size = $this->getSize2();
		}
		else
		{
		 	$size = $this->getSize();	
		}
        /*if ($size == 0) {
            return array('error' => 'File is empty');
        }*/
        
        if ($size > $this->sizeLimit) {
            return array('error' => 'File is too large');
        }
        if (isset($_REQUEST['filename'])) {
        $pathinfo = pathinfo($this->getName2());
		}
		else
		{
		 $pathinfo = pathinfo($this->getName());	
		}
        if($myfilename!=''){
			$filename = $myfilename;
		}else{
			$filename = $pathinfo['filename'];
		}
        //$filename = md5(uniqid());
		if(isset($pathinfo['extension']) && $pathinfo['extension']!=''){
        $ext = $pathinfo['extension'];

        if($this->allowedExtensions && !in_array(strtolower($ext), $this->allowedExtensions)){
            $these = implode(', ', $this->allowedExtensions);
            return array('error' => 'File has an invalid extension, it should be one of '. $these . '.');
        }
        
        if(!$replaceOldFile){
            /// don't overwrite previous files that were uploaded
            while (file_exists($uploadDirectory . $filename . '.' . $ext)) {
                $filename .= rand(10, 99);
            }
        }
       if (isset($_REQUEST['filename'])) {
        if ($this->save2($uploadDirectory . $filename . '.' . $ext)){
			$data['success']=true;
			$data['filename']=$uploadDirectory.$filename . '.' . $ext;
			$data['ext']=$ext;
           // return array('success'=>true);
		   return $data;
        } else {
            return array('error'=> 'Could not save uploaded file.' .
                'The upload was cancelled, or server error encountered');
        }
	  }
	  else
	  {
		if ($this->save($uploadDirectory . $filename . '.' . $ext)){
            $data['success']=true;
			$data['filename']=$uploadDirectory.$filename . '.' . $ext;
			$data['ext']=$ext;
           // return array('success'=>true);
		   return $data;
        } else {
            return array('error'=> 'Could not save uploaded file.' .
                'The upload was cancelled, or server error encountered');
        }  
	  }
		}else{
			 return array('error'=> 'Could not save uploaded file');
		}
    }    






/**
     * Save the file to the specified path
     * @return boolean TRUE on success
     */
    function save($path) {
        if(!move_uploaded_file($_FILES['qqfile']['tmp_name'], $path)){
            return false;
        }
        return true;
    }
    function getName() {
        return isset($_FILES['qqfile']['name'])?$_FILES['qqfile']['name']:'';
    }
    function getSize() {
        return $_FILES['qqfile']['size'];
    }
	
	
	
	/**
     * Save the file to the specified path
     * @return boolean TRUE on success
     */
    function save2($path) {    
        $input = fopen("php://input", "r");
        $temp = tmpfile();
        $realSize = stream_copy_to_stream($input, $temp);
        fclose($input);
        
        if ($realSize != $this->getSize2()){            
            return false;
        }
        
        $target = fopen($path, "w");        
        fseek($temp, 0, SEEK_SET);
        stream_copy_to_stream($temp, $target);
        fclose($target);
        
        return true;
    }
    function getName2() {
        return isset($_REQUEST['filename'])?$_REQUEST['filename']:'';
    }
    function getSize2() {
        if (isset($_SERVER["CONTENT_LENGTH"])){
            return (int)$_SERVER["CONTENT_LENGTH"];            
        } else {
            throw new Exception('Getting content length is not supported.');
        }      
    }   
	
	} 
 


?>