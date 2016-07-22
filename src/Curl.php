<?php
/**
 * Slim - a micro PHP 5 framework
 *
 * @author      Himabindu
 *  @package    Slim
  * @author     Josh Lockhart
  * @since      1.6.0
  */
class Curl 
{
    /**
     * @var array
     */
    public $CurlData = Array();

    /**
     * Constructor
     * @param array $settings
     */
    public function __construct($settings = array())
    {
        $this->CurlData = $settings;
    }

    /**
     * Call
     */
    public function call()
    {
      $this->next->call();
    }

    /**
     * Parse input
     *
     * This method will attempt to parse the request body
     * based on its content type if available.
     *
     * @param  string $input
     * @param  string $contentType
     * @return mixed
     */
    public function loadCurl ()
    {
       $ch = curl_init();

        //URL setting in curl
        curl_setopt($ch, CURLOPT_URL,$this->CurlData["url"]);

        //Post data Checking, if exist then posting here

        if (isset($this->CurlData["postData"]) && is_array($this->CurlData["postData"])) {
            curl_setopt($ch, CURLOPT_POST ,1);
            curl_setopt($ch, CURLOPT_POSTFIELDS , $this->CurlData["postData"]);
        }

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION ,1);
        curl_setopt($ch, CURLOPT_HEADER ,0);  // DO NOT RETURN HTTP HEADERS
      
       $result = json_decode(curl_exec($ch));
        if(CRUL_ERROR_FLAG == 1){
            $json_errors = array(
                JSON_ERROR_NONE => '1',
                JSON_ERROR_DEPTH => 'The maximum stack depth has been exceeded',
                JSON_ERROR_CTRL_CHAR => 'Control character error, possibly incorrectly encoded',
                JSON_ERROR_SYNTAX => 'Syntax error',
            );
            if($json_errors[json_last_error()] == "1"){
                $this->sessionData($result->data);
                return $result; 
            }else{
                echo curl_exec($ch);exit;
            }
        }else{
           $this->sessionData($result->data);
           return $result; 
        }
  }

    //Files Upload Curl
    public function loadFilesData ()
    {
        //Initiate cURL.
        $ch = curl_init($this->CurlData["url"]);
        //Encode the array into JSON.
        $str = http_build_query($this->CurlData["postData"]);

        //Tell cURL that we want to send a POST request.

        curl_setopt($ch, CURLOPT_POST, 1);
         
        //Attach our encoded JSON string to the POST fields.
        curl_setopt($ch, CURLOPT_POSTFIELDS, $str);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION ,1);
        curl_setopt($ch, CURLOPT_HEADER ,0);

        $result = json_decode(curl_exec($ch));
        if(CRUL_ERROR_FLAG == 1){
            $json_errors = array(
                JSON_ERROR_NONE => '1',
                JSON_ERROR_DEPTH => 'The maximum stack depth has been exceeded',
                JSON_ERROR_CTRL_CHAR => 'Control character error, possibly incorrectly encoded',
                JSON_ERROR_SYNTAX => 'Syntax error',
            );
            if($json_errors[json_last_error()] == "1"){
                return $result; 
            }else{
                echo curl_exec($ch);exit;
            }
        }else{
           return $result; 
        }
      
     }

     //Session Data
     public function sessionData($data){
        

        if(!empty($data->access_token) && !empty($data)){
            $_SESSION["aToken"] = $data->access_token;
        }
        if(isset($data->company->code)){
            $_SESSION["company_code"] = $data->company->code;
        }
        if(isset($data->company->company_id)){
             $_SESSION["company_id"] = $data->company->company_id;
        }
        if(isset($data->company->name)){
            $_SESSION["company_name"] = $data->company->name;
        }
        if(isset($data->company->logo)){
             $_SESSION["company_logo"] = $data->company->logo;
        }
            
     }
  
}
