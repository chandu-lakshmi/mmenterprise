<?php
//Update Company
$app->post('/update_company', function ($request, $response, $args) use ($app) {

    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'update_company');

    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;

    $_POST["code"] = $_POST["company_code"];

    if(isset($_FILES['company_logo']['tmp_name']) && !empty($_FILES['company_logo']['tmp_name'])){
        $_POST['company_logo'] = $_FILES['company_logo'];
    }

    if(isset($_FILES['images']) && count($_FILES['images'])>0  && !empty($_FILES['images'])){

        foreach($_FILES['images']['tmp_name'] as $key => $tmp_name ){
            $file['name']       = $_FILES['images']['name'][$key];
            $file['size']       = $_FILES['images']['size'][$key];
            $file['tmp_name']   = $_FILES['images']['tmp_name'][$key];
            $file['type']       = $_FILES['images']['type'][$key];
            $file['error']      = $_FILES['images']['error'][$key];
            $storage[] = $file;
        }
        
        $_POST['images'] = $storage; 
    }

      
    $updateCompany     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

   echo json_encode( $updateCompany->loadFilesData() );
});

//company profile page
$app->get('/company-profile', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
        
});

//import contacts page
$app->get('/import-contacts', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
        
});
//Contacts Upload
$app->post('/contacts_upload',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    $_POST['contacts_file'] = $_FILES['contacts_file'];
   
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'contacts_upload');
    //print_r($_POST);exit;
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
    $apiEndpoint = getapiEndpoint($this->settings, 'contacts_list');
   
    $bucketList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     echo json_encode( $bucketList->loadCurl() );
});

//Job Post
$app->post('/email_invitation',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
     
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'email_invitation');
   
    $bucketList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     echo json_encode( $bucketList->loadCurl() );
});

//Dashboard Page
$app->get('/dashboard',function ($request, $response, $args) use ($app) {
    //Arguments
    $args       = commonArgs($this->settings);
   
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

//Job Post
$app->post('/post_job',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyDetails;
    
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
