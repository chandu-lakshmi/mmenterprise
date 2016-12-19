<?php

// Common Arguments using in functions
function commonArgs ($settings=array()) {
	return array(
			'API_DOMAIN' 	=> $settings['APP']['API_DOMAIN'],
			'APP_DOMAIN' 	=> $settings['APP']['APP_DOMAIN'],
			'CLIENT_ID'		=> $settings['APP']['CLIENT_ID'],
			'CLIENT_SECRET' => $settings['APP']['CLIENT_SECRET'],
			'VERSION'		=> $settings['APP']['VERSION'],
			'PREFIX' 		=> $settings['APP']['PREFIX'],
			'PASSWORD_GRANT' => $settings['APP']['PASSWORD_GRANT'],
            'APP_VERSION'    => $settings['APP']['APP_VERSION']
			);
}

//Authentication Check
function authenticate () {
	if( empty($_SESSION['access_token']) && !isset($_SESSION['access_token']) ) {
		return 1;
	}
}

//API URL endpoint from settings
function getapiEndpoint($settings=array(), $endpoint) {
	$url  = $settings['APP']['API_DOMAIN'];
	$url .= $settings['API'][$endpoint]['VERSION'];
	$url .= $settings['API'][$endpoint]['ENDPOINT'];
	//echo $url;exit;
	return $url;
}

//USER AND COMPANY DETAILS For arguments
function commonData ($settings = array()) {
	$companyDetails = array(
		'company_name' => $_SESSION['company']['company_name'],
		'company_logo' => $_SESSION['company']['company_logo']);
	$userDetails = array(
		'user_name' => $_SESSION['user']->firstname,
		'user_id' => $_SESSION['user']->id,
		'user_email' => $_SESSION['user']->emailid,
                'user_dp'   => $_SESSION['user']->user_dp);
        $userPermissions = $_SESSION['userPermissions'];
	return array(
			'API_DOMAIN' 	=> $settings['APP']['API_DOMAIN'],
			'APP_DOMAIN' 	=> $settings['APP']['APP_DOMAIN'],
			'PATH'          => $settings['APP']['PATH'],
            'APP_VERSION'   => $settings['APP']['APP_VERSION'],
            'EMAIL_PARSER_DOMAIN'    => $settings['EMAIL_PARSER']['EMAIL_PARSER_DOMAIN'],
			'user_details'	=> isset($userDetails)?json_encode($userDetails):array(),
			'company_details' => isset($companyDetails)?json_encode($companyDetails):array(),
                        'userPermissions' => isset($userPermissions)?json_encode($userPermissions):array(),
		);
}
function parserData($settings = array()){
    return array(
    		'API_DOMAIN' 	=> $settings['APP']['API_DOMAIN'],
			'APP_DOMAIN' 	=> $settings['APP']['APP_DOMAIN'],
			'PATH'          => $settings['APP']['PATH'],
            'APP_VERSION'    => $settings['APP']['APP_VERSION'],
			'EMAIL_PARSER_DOMAIN'    => $settings['EMAIL_PARSER']['EMAIL_PARSER_DOMAIN'],
		);
}
function companyProfile($settings){
    //echo "<pre>";
       //print_r($settings);exit;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($settings, 'get_company_profile');

    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     $data = json_decode($companyDetails->loadCurl(),true);
     if(isset($data['data'])){
       //update the user permissions userPermissions  
        if(isset($_SESSION['userPermissions'])){
              $arrayList["userPermissions"] = $data['data']['userPermissions'];
              $arrayList["userDetails"] = $data['data']['userDetails'];
            //Update Session
            updateSession($arrayList);
         }
         
       return ($data['data']);  
     }else{
        return array(); 
     }
          
     
}


//Session Details
function setSession($result = "") {
	$result = json_decode($result);
	$session = new Session();
	$data = Array();
	if(!empty($result->data)) {

		if(isset($result->data->access_token) && !empty($result->data->access_token)) {
			$data["access_token"] = $result->data->access_token;
		}else{
			$data["access_token"] = $session->get('access_token');
		}
		
		$data["user"] = $result->data->user;
		$data["company"] = array(
				"company_id" => $result->data->company->company_id,
				"company_code" => $result->data->company->code,
				"company_name" => $result->data->company->name,
				"company_logo" => $result->data->company->logo,
			);
                $data['userPermissions'] = get_object_vars($result->data->userPermissions);
    	$session->set($data);
	}
}

//Update Session in array
function updateSession($resultArray = array()){
	$session = new Session();
//        if(isset($_SESSION['userPermissions'])){
//            $session->delete('userPermissions');
//        
//        }
	$session->updateArray($resultArray);
}

//Session Destroy
function sessionDestroy(){
	$session = new Session();
	$session->delete('access_token');
	$session->delete('user');
	$session->delete('company');
        $session->delete('userPermissions');
	$session->destroy();
}

//Delete Session
function checkJsonResult($jsonResult = "") {

	if(CRUL_ERROR_FLAG == 0) {
		$result = json_decode($jsonResult);
		if ( json_last_error() > 0 ) {
			return $result;
		}
	}
	return $jsonResult;
}



?>