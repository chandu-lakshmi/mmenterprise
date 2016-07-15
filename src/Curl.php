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
           // print_r($this->CurlData["postData"]);exit;
            curl_setopt($ch, CURLOPT_POST ,1);
            curl_setopt($ch, CURLOPT_POSTFIELDS , $this->CurlData["postData"]);
        }

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION ,1);
        curl_setopt($ch, CURLOPT_HEADER ,0);  // DO NOT RETURN HTTP HEADERS
      
        $result = json_decode(curl_exec($ch));
       
        if(!empty($result->data->access_token) && !empty($result->data)){
            $_SESSION["aToken"] = $result->data->access_token;
        }
        if(isset($result->data->company->code)){
            $_SESSION["company_code"] = $result->data->company->code;
        }
        if(isset($result->data->company->company_id)){
             $_SESSION["company_id"] = $result->data->company->company_id;

        }

        return $result;
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
        return $result;   
     }
  
}
