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
    public $CurlData;

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
        if (!$this->CurlData["postData"]) {
            curl_setopt($ch, CURLOPT_POST ,1);
            curl_setopt($ch, CURLOPT_POSTFIELDS , $this->CurlData["postData"]);
        }

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION ,1);
        curl_setopt($ch, CURLOPT_HEADER ,0);  // DO NOT RETURN HTTP HEADERS
       // echo  curl_exec($ch);exit;
        $result = json_decode(curl_exec($ch));
        

        if(!empty($result->data->access_token) && !empty($result->data)){
            $_SESSION["aToken"] = $result->data->access_token;
        }
        return $result;
    }
  
}
