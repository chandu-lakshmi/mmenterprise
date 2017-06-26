<?php

/**
 * Slim - a micro PHP 5 framework
 *
 * @author      Karthik
 *  @package    Slim
 * 
 */
class Curl {

    /**
     * @var array
     */
    public $CurlData = Array();

    /**
     * Constructor
     * @param array $settings
     */
    public function __construct($settings = array()) {
        $this->CurlData = $settings;
    }

    /**
     * Call
     */
    public function call() {
        $this->next->call();
    }

    /**
     * Load the curl 
     *
     * @param  string $_POst (optional)
     * @return mixed
     */
    public function loadCurl() {

        $ch = curl_init();
        //URL setting in curl
        curl_setopt($ch, CURLOPT_URL, $this->CurlData["url"]);

        //Post data Checking, if exist then posting here

        if (isset($this->CurlData["postData"]) && is_array($this->CurlData["postData"])) {
            $str = http_build_query($this->CurlData["postData"]);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $str);
        }

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS

        if (curl_errno($ch)) {
            throw new Exception(curl_error($ch));
        }
        return curl_exec($ch);
    }

    /**
     * Load the AI curl 
     *
     * @param  string $_POST
     * @return mixed
     */
    public function loadAICurl() {
        
        $endpoint = $this->CurlData["endpoint"];
        $username = $this->CurlData["username"];
        $password = $this->CurlData["password"];
        $postData = $this->CurlData["postData"];
        
        $process = curl_init($endpoint);
        curl_setopt($process, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($process, CURLOPT_HEADER, 0);
        curl_setopt($process, CURLOPT_USERPWD, $username . ":" . $password);
        curl_setopt($process, CURLOPT_TIMEOUT, 30);
        curl_setopt($process, CURLOPT_POST, 1);
        curl_setopt($process, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
        $return = curl_exec($process);
        curl_close($process);
        
        return $return;
    }

}
