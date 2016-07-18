<?php
//Dashboard Page
$app->get('/dashboard',function ($request, $response, $args) use ($app) {
    //Arguments
    $args       = commonArgs($this->settings);
   //echo $_SESSION["atoken"];exit;
     //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
   
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Post Job Page
$app->get('/job/post-job',function ($request, $response, $args) use ($app) {
    //Arguments
    $args       = commonArgs($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Post job Page
$app->get('/postJob',function ($request, $response, $args) use ($app) {
	//Arguments
    $args       = commonArgs($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    // Render dashboard view
    return $this->renderer->render($response, 'post-job.phtml', $args);
});

//Contacts Upload
$app->post('/contacts_upload',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    $_POST['contacts_file'] = $_FILES['contacts_file'];
    //print_r($_POST);exit;
   
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'contacts_upload');
   
    $contactUpload     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

      echo json_encode( $contactUpload->loadFilesData() );
});

//Bucket List
$app->post('/buckets_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'buckets_list');
   
    $bucketList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     echo json_encode( $bucketList->loadCurl() );
});

//Contact List
$app->post('/contact_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'contact_list');
   
    $bucketList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     echo json_encode( $bucketList->loadCurl() );
});

//Job Post
$app->post('/post_job',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
     
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'post_job');
   
    $bucketList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     echo json_encode( $bucketList->loadCurl() );
});


//Logout
$app->get("/logout", function ($request, $response, $args) { 
    session_destroy(); 
    //Arguments
    $args       = commonArgs($this->settings);
    return $response->withRedirect($args['APP_DOMAIN']);
}); 
