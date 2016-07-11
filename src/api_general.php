<?php 

//Get Job Functions
$app->get('/get_job_functions',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);

    $getJobFun 	= new Curl(array(
        'url'   => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/get_job_functions",
     ));
     echo json_encode( $getJobFun->loadCurl() );
});

//Get Industries
$app->get('/get_industries',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);

    $getInd 	= new Curl(array(
        'url'   => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/get_industries",
     ));
     echo json_encode( $getInd->loadCurl() );
});

//Get Employee Types
$app->get('/get_employment_types',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);

    $getEmpTypes 	= new Curl(array(
        'url'   => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/get_employment_types",
     ));
     echo json_encode( $getEmpTypes->loadCurl() );
});

//Get Experience
$app->get('/get_experiences',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);

    $getExp 	= new Curl(array(
        'url'   => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/get_experiences",
     ));
     echo json_encode( $getExp->loadCurl() );
});
