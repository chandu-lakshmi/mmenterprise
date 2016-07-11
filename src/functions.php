<?php
// Common Arguments using in functions
function commonArgs ( $settings=array() ) {

	return array(
			'API_DOMAIN' 	=> $settings['APP']['API_DOMAIN'],
			'APP_DOMAIN' 	=> $settings['APP']['APP_DOMAIN'],
			'CLIENT_ID'		=> $settings['APP']['CLIENT_ID'],
			'CLIENT_SECRET' => $settings['APP']['CLIENT_SECRET'],
			'VERSION'		=> $settings['APP']['VERSION'],
			'PREFIX' 		=> $settings['APP']['PREFIX'],
			);
}

//Authentication Check
function authenticate () {
	if( empty($_SESSION['aToken']) && !isset($_SESSION['aToken']) ) {
		return 1;
	}
}

?>