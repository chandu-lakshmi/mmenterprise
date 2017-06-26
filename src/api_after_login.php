<?php
use \library\fileupload_library as file_upload;
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

    //Upload mutliple images
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
    $jsonResult = checkJsonResult( $updateCompany->loadCurl() );
    $result = json_decode($jsonResult);
    $arrayList["company"] = array(
            "company_id" => $_POST["company_id"],
            "company_code" => $_POST["company_code"],
            "company_logo" => isset($result->data->company_logo)?$result->data->company_logo:"",
            "company_name" => $_POST["company"],
        );
    //Update Session
    updateSession($arrayList);
    $_SESSION['time_zone'] = $_POST['timeZone'];
    
    return $jsonResult;
});

$app->post('/get_user_permissions', function ($request, $response, $args) use ($app) {

    $apiEndpoint = getapiEndpoint($this->settings, 'get_user_permissions');
     $this->mintmeshAccessToken;
     $this->mintmeshCompanyId;
    $userPermissions     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    $jsonResult = checkJsonResult( $userPermissions->loadCurl() );
    $result = json_decode($jsonResult);
    $arrayList['userPermissions'] = array(
        $result->data);
    
    
    
    return $jsonResult;
});

//company profile page
$app->get('/company-profile', function ($request, $response, $args) {
    $this->mintmeshAccessToken;
    // need to take a look later    
    $args = commonData($this->settings);
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
//    else if(isset($_SESSION['sign']['sign_in']) && $_SESSION['sign']['sign_in'] == 1){
//         return $response->withRedirect($args['APP_DOMAIN'].'edit-company-profile');
//    }
//    else{
        $args['comp_data'] = companyProfile($this->settings);
        return $this->renderer->render($response, 'index.phtml', $args);
//    }
        
});

//import contacts page
$app->get('/import-contacts', function ($request, $response, $args) {
    $this->mintmeshAccessToken;
    // need to take a look later    
    $args = commonData($this->settings);

    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
//    $args['user_data'] = userPermissions($this->settings);
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
    $contactUpload     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $contactUpload->loadCurl() );
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

     return checkJsonResult( $bucketList->loadCurl() );
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

     return checkJsonResult( $bucketList->loadCurl() );
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

     return checkJsonResult( $bucketList->loadCurl() );
});

//Dashboard Page
$app->get('/dashboard',function ($request, $response, $args) use ($app) {
    //Arguments
     $this->mintmeshAccessToken;
     //$_SESSION['sigin'] = 0;
    $args       = commonData($this->settings);
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    else if($_SESSION['userPermissions']['dashboard']==1)
    {
    //Check Logged in or not
   
    $args['comp_data'] = companyProfile($this->settings);

    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    }else{
        return $response->withRedirect($args['APP_DOMAIN'].'404');
    }
});

//Post Job Page
$app->get('/job',function ($request, $response, $args) use ($app) {
    $this->mintmeshAccessToken;
    //Arguments
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Post Job Page
$app->get('/job/post-job',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
     //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    else if($_SESSION['userPermissions']['post_jobs']==1)
     {
    $args['comp_data'] = companyProfile($this->settings);
//    $args['user_data'] = userPermissions($this->settings);
    
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
     }else{
         return $response->withRedirect($args['APP_DOMAIN'].'404');
     }
});

//Post Job Page
$app->get('/job/post-job-2',function ($request, $response, $args) use ($app) {
     $args       = commonData($this->settings);
     if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
     //Arguments
    else if($_SESSION['userPermissions']['post_jobs']==1)
     {
   
    //Check Logged in or not

     return $response->withRedirect($args['APP_DOMAIN']."job/post-job");
     }else{
        return $response->withRedirect($args['APP_DOMAIN'].'404');
     }
});

//Post job Page
$app->get('/postJob',function ($request, $response, $args) use ($app) {
  //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    else if($_SESSION['userPermissions']['post_jobs']==1)
    {
    
    //Check Logged in or not
   

    $args['comp_data'] = companyProfile($this->settings);
//    $args['user_data'] = userPermissions($this->settings);

    // Render dashboard view
    return $this->renderer->render($response, 'post-job.phtml', $args);
    }else{
        return $response->withRedirect($args['APP_DOMAIN'].'404');
    }
});

//Job Post
$app->post('/post_job',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $this->mintmeshCompanyDetails;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'post_job');
    
    $session = new Session();
    $_POST['company_logo'] = $session->get('company_logo');

    $postJob     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $postJob->loadCurl() );
});

//Job List
$app->post('/jobs_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    $_SESSION['time_zone'] = $_POST['time_zone'];
    
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'jobs_list');
   
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});

//Job Details
$app->post('/job_details',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token, Company Details 
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'job_details');
   
    $jobDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobDetails->loadCurl() );
    
});

//Close Job Details
$app->post('/deactivate_post',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token, Company Details 
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'deactivate_post');
   
    $deactivate_post    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $deactivate_post->loadCurl() );
});

//Job Referral Details
$app->post('/job_referral_details',function ($request, $response, $args) use ($app) {
    // dynamically Access Token, Company Details 
   if(!empty($_SESSION['time_zone']) && isset($_SESSION['time_zone'])){
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'job_referral_details');
   
    $jobDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    return checkJsonResult( $jobDetails->loadCurl() );
   }else{
       return '{"status_code":400}';
   }
    
});
$app->get('/job/job-details/{id}', function ($request, $response, $args) use ($app) {

    $route = $request->getAttribute('route');
$this->mintmeshAccessToken;
    //Arguments
    $args  = commonData($this->settings);
    $args['post_id'] = $route->getArgument('id') ;
  
    if(!empty($args['post_id'])){
        
        //Check Logged in or not
        if(!empty(authenticate())){
          return $response->withRedirect($args['APP_DOMAIN']);
        }

        $args['comp_data'] = companyProfile($this->settings);
        // Render dashboard view
        return $this->renderer->render($response, 'index.phtml', $args);
    }else{
        return $response->withRedirect($args['APP_DOMAIN']."/job");
    }
});
//Update Status Details
$app->post('/process_job',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;   
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'process_job');
   
    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $statusDetails->loadCurl() );

       
});

//engagement contacts Page - If it reload redirects to front job details page
$app->get('/job/engagement-contacts/{id}',function ($request, $response, $args) use ($app) {
     
    $route = $request->getAttribute('route');

    //Arguments
    $args  = commonData($this->settings);
    $post_id = $route->getArgument('id') ;
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

     return $response->withRedirect($args['APP_DOMAIN']."job/job-details/".$post_id);
});

//Reward Page - If it reload redirects to front job details page
$app->get('/job/rewards/{id}',function ($request, $response, $args) use ($app) {
     
    $route = $request->getAttribute('route');

    //Arguments
    $args  = commonData($this->settings);
    $post_id = $route->getArgument('id') ;
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    return $response->withRedirect($args['APP_DOMAIN']."job/job-details/".$post_id);
});

//Update Status Details
$app->post('/get_services',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;  
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_services');
   $_POST['service_type'] = "global";
   $_POST['user_country'] = "all";

    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $statusDetails->loadCurl() );
       
});

// edit company profile
$app->get('/edit-company-profile',function ($request, $response, $args) use ($app) {
    $this->mintmeshAccessToken;
//Arguments
    $args       = commonData($this->settings);
   
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

// License Management
$app->get('/license-management',function ($request, $response, $args) use ($app) {
    $this->mintmeshAccessToken;
//Arguments
    $args       = commonData($this->settings);
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }else if($_SESSION['userPermissions']['is_primary'] == 1)
    {
    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    }
    else{
          return $response->withRedirect($args['APP_DOMAIN'].'404');
    }
});

//Dashboard Details
$app->post('/view_dashboard',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken; 
    $this->mintmeshCompanyId;
//    $_POST['time_zone'] = $_SESSION['time_zone'];
    //$_SESSION['time_zone'] = $_POST['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'view_dashboard');
    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $statusDetails->loadCurl() );
});

// awating action
$app->post('/awaiting_action',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;  
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'awaiting_action');
   
    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $statusDetails->loadCurl() );

       
});

//Contacts Page
$app->get('/contacts',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
   
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//create_bucket
$app->post('/create_bucket',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
      
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'create_bucket');
   
    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $statusDetails->loadCurl() );
   
});

//candidates
$app->get('/candidates/resume-room',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//candidates upload-resume
$app->get('/candidates/upload-resume',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//candidates find-resume
$app->get('/candidates/find-resume',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//upload bulk resume
$app->post('/upload_resume',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token 
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'upload_resume');
   
    $candidatesList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $candidatesList->loadCurl() );
    
});


$app->post('/get_company_all_referrals',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token 
   $this->mintmeshAccessToken;
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_company_all_referrals');
   
    $candidatesList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $candidatesList->loadCurl() );
    
});


// upload contacts new
$app->post('/upload_contacts',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token, Company Details 
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
    
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'upload_contacts');
   
    $jobDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $jobDetails->loadCurl() );
    
});

//Settings Page
/*$app->get('/settings/company-profile',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
   
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});*/

// my profile under settings page
$app->get('/settings/my-profile',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    
    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    //return $response->withRedirect($args['APP_DOMAIN']."settings/company-profile");
});

// user profile under settings page
$app->get('/settings/user-group',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    //return $response->withRedirect($args['APP_DOMAIN']."settings/company-profile");
});

// user profile under settings page
$app->get('/settings/configuration-manager',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    //return $response->withRedirect($args['APP_DOMAIN']."settings/company-profile");
});

// integration manager
$app->get('/settings/integration-manager/{tab}',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
    //return $response->withRedirect($args['APP_DOMAIN']."settings/company-profile");
});

// campaigns
$app->get('/campaigns/all-campaigns',function ($request, $response, $args) use ($app) {
    //Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
   
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->get('/campaigns/my-campaigns',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    return $response->withRedirect($args['APP_DOMAIN']."campaigns/all-campaigns");
});

$app->get('/campaigns/edit-campaigns',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }
    return $response->withRedirect($args['APP_DOMAIN']."campaigns/all-campaigns");
});

//Logout
$app->get("/logout", function ($request, $response, $args) { 
    sessionDestroy();
    //Arguments
    $args = commonData($this->settings);
    return $response->withRedirect($args['APP_DOMAIN']);
}); 

//Company Details
$app->post('/view_company_details',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'view_company_details');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );
});

//Company Details
$app->post('/update_contacts_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'update_contacts_list');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );
});

//Company Details
$app->post('/other_edits_in_contact_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'other_edits_in_contact_list');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );      
});

//Company Details
$app->post('/add_contact',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'add_contact');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/permissions',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'permissions');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/add_user',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'add_user');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/add_group',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'add_group');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $companyDetails->loadCurl() );
    return $jsonResult;
});

$app->post('/get_groups',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_groups');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/update_user',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'update_user');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/change_password',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'change_password');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/campaigns_list',function ($request, $response, $args) use ($app) {

//    if(!empty($_SESSION['time_zone']) && isset($_SESSION['time_zone'])){
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'campaigns_list');
    //$_POST['time_zone'] = $_SESSION['time_zone'];
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
//      }else{
//        return '{"status_code":400}';
//   }
});

$app->post('/add_campaign',function ($request, $response, $args) use ($app) {
//    if(!empty($_SESSION['time_zone']) && isset($_SESSION['time_zone'])){ 
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'add_campaign');
    //$_POST['time_zone'] = $_SESSION['time_zone'];
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
//     }else{
//        return '{"status_code":400}';
//   }
});

$app->post('/view_campaign',function ($request, $response, $args) use ($app) {
//    if(!empty($_SESSION['time_zone']) && isset($_SESSION['time_zone'])){ 
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);
    
    $apiEndpoint = getapiEndpoint($this->settings, 'view_campaign');
   //$_POST['time_zone'] = $_SESSION['time_zone'];
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
//     }else{
//        return '{"status_code":400}';
//   }
});

//mintbot
$app->get('/mintbot', function ($request, $response, $args) {
    $this->mintmeshAccessToken;
    // need to take a look later    
    $args = commonData($this->settings);

    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);
//    $args['user_data'] = userPermissions($this->settings);
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
        
});

$app->post('/resend_activation_link',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);
    
    $apiEndpoint = getapiEndpoint($this->settings, 'resend_activation_link');
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/multiple_awaiting_action',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);
    
    $apiEndpoint = getapiEndpoint($this->settings, 'multiple_awaiting_action');
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/add_job',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    $args  = commonData($this->settings);
    
    $apiEndpoint = getapiEndpoint($this->settings, 'add_job');
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
     return checkJsonResult( $companyDetails->loadCurl() );
});
//Company Details
$app->POST('/file_upload',function ($request, $response, $args) {
    require 'library/fileupload_library.php';
    $file_upload = new fileupload_library; 
            $args       = commonData($this->settings);
        if (!isset($_REQUEST['filename']) && !isset($_FILES['qqfile'])) {
            $_REQUEST['filename'] = $_REQUEST['qqfile'];
        }
        if (!empty($_SERVER['HTTP_WMTGOAT']) || isset($_FILES['qqfile']) || isset($_REQUEST['filename'])) {
            if (!empty($_SERVER['HTTP_WMTGOAT'])) {
                $_REQUEST['filename'] = $_SERVER['HTTP_WMTGOAT'];
            }
            //print_r($_REQUEST['filename']);exit;
            $allowedExtensions = array('jpg', 'gif', 'png', 'jpeg', 'eps', 'cdr', 'ai', 'psd', 'tga', 'tiff', 'tif', 'ttf', 'svg', 'zip', 'rar',
                'gz', 'tar', 'tarz', '7zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pps', 'ppsx', 'pdf', 'eml', 'msg',
                'txt', 'rtf', 'wps', 'csv', 'xml', 'otf', 'eot', 'webm', 'ogg', 'ogv',
                'mp3', 'm4a', 'aac', 'wmv', 'wma', 'avi', 'mp4', 'mov', 'mpg', 'qxd', 'qxp', 'swf', 'fla', 'odt', 'vsd', 'wav', 'aiff',
                'sit', 'sitx', 'numbers', 'pages', 'key', 'ps', 'avi','cer');
            // max file size in bytes
            $sizeLimit = 26 * 1024 * 1024;
            $myfilename = 'attach_' . mt_rand().time();
            //upload the file and validate the size and file type
            $uploader = $file_upload->fileUpload($allowedExtensions, $sizeLimit);
            //return the file original and source name and path
            $path = $args['PATH'];
            $result = $file_upload->handleUpload(''.$path.'uploads/', FALSE, $myfilename);
            if (isset($result['success']) && $result['success'] == true) {
                    
               
                if (isset($_REQUEST['filename']) || isset($_REQUEST['qqfile'])) {
                    $org_name = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : (isset($_REQUEST['qqfile']) ? $_REQUEST['qqfile'] : '');
                } elseif (isset($_FILES['qqfile'])) {
                    $org_name = $_FILES['qqfile']['name'];
                } else {
                    $org_name = '';
                }
                //$result['org_name'] = $org_name;
            
                $fname =  str_replace('_',' ',$org_name);
                //$result['org_name'] = pathinfo(filterString($fname), PATHINFO_FILENAME);
                $result['org_name'] = $fname;
                $result['size'] = $result['size']/1000;
                $result['filename'] = 'uploads/'.$myfilename.'.'.$result['ext'];
                $data['success'] = true;
                echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);
            } else {
                $data['success'] = false;
                $data['msg'] = 'Maximum file size is 26MB';
                echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
            }
        } else {
            $data['success'] = false;
            $data['msg'] = 'No file uploaded';
            echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
        }
  
});
//contacts upload
$app->POST('/contacts_file_upload',function ($request, $response, $args) {
    $args       = commonData($this->settings);
    require 'library/fileupload_library.php';
    $file_upload = new fileupload_library; 
        if (!isset($_REQUEST['filename']) && !isset($_FILES['qqfile'])) {
            $_REQUEST['filename'] = $_REQUEST['qqfile'];
        }
        if (!empty($_SERVER['HTTP_WMTGOAT']) || isset($_FILES['qqfile']) || isset($_REQUEST['filename'])) {
            if (!empty($_SERVER['HTTP_WMTGOAT'])) {
                $_REQUEST['filename'] = $_SERVER['HTTP_WMTGOAT'];
            }
            
            $allowedExtensions = array('csv', 'xlsx', 'xls');
            // max file size in bytes
            $sizeLimit = 26 * 1024 * 1024;
            $myfilename = 'attach_' . mt_rand().time();
            //upload the file and validate the size and file type
            $uploader = $file_upload->fileUpload($allowedExtensions, $sizeLimit);
            //return the file original and source name and path
            $path = $args['PATH'];

            $result = $file_upload->handleUpload(''.$path.'uploads/', FALSE, $myfilename);
            if (isset($result['success']) && $result['success'] == true) {
                    
                if (isset($_REQUEST['filename']) || isset($_REQUEST['qqfile'])) {
                    $org_name = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : (isset($_REQUEST['qqfile']) ? $_REQUEST['qqfile'] : '');
                } elseif (isset($_FILES['qqfile'])) {
                    $org_name = $_FILES['qqfile']['name'];
                } else {
                    $org_name = '';
                }
               
                $fname =  str_replace('_',' ',$org_name);
                $result['org_name'] = $fname;
                $result['filename'] = 'uploads/'.$myfilename.'.'.$result['ext'];
                
                // dynamically Access Token
                $this->mintmeshAccessToken;
                $_POST['file_name'] = $result['filename'];
                
                // getting API endpoint from settings
                $apiEndpoint = getapiEndpoint($this->settings, 'validate_headers');
                $companyDetails     = new Curl(array(
                    'url'           => $apiEndpoint,
                    'postData'      => $_POST
                 ));

                $response  = checkJsonResult( $companyDetails->loadCurl() );
                $response  =  json_decode($response);
                if($response->status_code == 200){
                    $data['success'] = true;
                    $data = $result;
                }  else {
                    $data['success'] = false;
                    $data['msg'] = $response->message->msg[0] ;   
                }         
                echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
            } else {
                $data['success'] = false;
                $data['msg'] = 'Maximum file size is 26MB';
                echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
            }
        } else {
            $data['success'] = false;
            $data['msg'] = 'No file uploaded';
            echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
        }
});
//contacts upload
$app->POST('/resume_file_upload',function ($request, $response, $args) {
    $args       = commonData($this->settings);
    require 'library/fileupload_library.php';
    $file_upload = new fileupload_library; 
        if (!isset($_REQUEST['filename']) && !isset($_FILES['qqfile'])) {
            $_REQUEST['filename'] = $_REQUEST['qqfile'];
        }
        if (!empty($_SERVER['HTTP_WMTGOAT']) || isset($_FILES['qqfile']) || isset($_REQUEST['filename'])) {
            if (!empty($_SERVER['HTTP_WMTGOAT'])) {
                $_REQUEST['filename'] = $_SERVER['HTTP_WMTGOAT'];
            }
            
            $allowedExtensions = array('doc','docx','pdf','rtf','jpg', 'png', 'jpeg','txt');
            // max file size in bytes
            $sizeLimit  = $this->settings['MAX_RESUME_FILE_UPLOAD_SIZE'];
            $myfilename = 'attach_' . mt_rand().time();
            //upload the file and validate the size and file type
            $uploader = $file_upload->fileUpload($allowedExtensions, $sizeLimit);
            //return the file original and source name and path
            $path   = $args['PATH'];
            $result = $file_upload->handleUpload(''.$path.'uploads/', FALSE, $myfilename);
            
            if (isset($result['success']) && $result['success'] == true) {
                    
                if (isset($_REQUEST['filename']) || isset($_REQUEST['qqfile'])) {
                    $org_name = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : (isset($_REQUEST['qqfile']) ? $_REQUEST['qqfile'] : '');
                } elseif (isset($_FILES['qqfile'])) {
                    $org_name = $_FILES['qqfile']['name'];
                } else {
                    $org_name = '';
                }
               
                $fname =  str_replace('_',' ',$org_name);
                $result['org_name'] = $fname;
                $result['size']     = $result['size']/1000;
                $result['filename'] = 'uploads/'.$myfilename.'.'.$result['ext'];
                $data['success']    = true;
                echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);
            } else if(isset($result['error'])) {
                #error for file size and Extensions
                $data['success'] = false;
                $data['msg'] = $result['error'];
                echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
            } else {
                $data['success'] = false;
                $data['msg'] = 'Failed to upload file from source';
                echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
            }
        } else {
            $data['success'] = false;
            $data['msg'] = 'No file uploaded';
            echo htmlspecialchars(json_encode($data), ENT_NOQUOTES);
        }
});

$app->get('/view_company_detail324',function ($request, $response, $args) {
  $this->mintmeshAccessToken;
  print_r(companyProfile($this->settings));
});

$app->post('/job_rewards',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    //$_POST['time_zone'] = $_SESSION['time_zone'];
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'job_rewards');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $companyDetails->loadCurl() );
});

$app->post('/job_post_from_campaigns',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'job_post_from_campaigns');
   
    $companyDetails     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $companyDetails->loadCurl() );
});

//Update Status Details
$app->post('/get_countries',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;  
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_countries');
   $_POST['service_type'] = "global";
   $_POST['user_country'] = "all";

    $statusDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult( $statusDetails->loadCurl() );
       
});

//Update Status Details
$app->get('/viewer',function ($request, $response, $args) use ($app) {

     $args['url'] = isset($_GET['url'])?$_GET['url']:'';
    if($args['url'] != ''){
    return $this->file_viewer->render($response, 'index-viewer.phtml', $args);
    }
    else{
         return $response->withRedirect($args['APP_DOMAIN'].'404');
    }
});


//License Management
$app->post('/get_company_subscriptions',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_company_subscriptions');
   
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});

// integration management
$app->post('/add_edit_hcm',function ($request, $response, $args) use ($app) {
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'add_edit_hcm');
   
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/add_edit_zenefits_hcm',function ($request, $response, $args) use ($app) {
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'add_edit_zenefits_hcm');
   
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/add_edit_icims_hcm',function ($request, $response, $args) use ($app) {
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'add_edit_icims_hcm');
   
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/get_hcm_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_hcm_list');
   //print_r($_POST).exit;
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/get_zenefits_hcm_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_zenefits_hcm_list');
   //print_r($_POST).exit;
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/get_icims_hcm_list',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_icims_hcm_list');
   //print_r($_POST).exit;
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});
$app->post('/get_hcm_partners',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company Details
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'get_hcm_partners');
    $jobList    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobList->loadCurl() );
});

//Contact List
$app->post('/company_all_contacts',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'company_all_contacts');
   
    $contactsList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $contactsList->loadCurl() );
});

//Adding configuration
$app->post('/add_configuration',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'add_configuration');
   
    $addConfiguration   = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $addConfiguration->loadCurl() );
});

//Get configuration
$app->post('/get_configuration',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token, Company id
    $this->mintmeshAccessToken;
    $this->mintmeshCompanyId;
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_configuration');
   
    $configurationDetails   = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

     return checkJsonResult( $configurationDetails->loadCurl() );
});

//Post Job
$app->post('/getResumeParser', function ($request, $response, $args) use ($app) {

    $username = $this->settings['AI_PARSER']['USERNAME'];
    $password = $this->settings['AI_PARSER']['PASSWORD'];
    // getting API endpoint from settings
    $endpoint = $this->settings['AI_PARSER']['BASE_URL'].$this->settings['AI_PARSER']['PARSE_JD'];
    $post = json_encode($_POST);
    $configurationDetails   = new Curl(array(
        'endpoint'      => $endpoint,
        'username'      => $username,
        'password'      => $password,
        'postData'      => $post
     ));
    
    return $configurationDetails->loadAICurl();
});


//Get Resumes with weights
$app->post('/getResumesFindByWeights', function ($request, $response, $args) use ($app) {

    $username = $this->settings['AI_PARSER']['USERNAME'];
    $password = $this->settings['AI_PARSER']['PASSWORD'];
    // getting API endpoint from settings
    $endpoint = $this->settings['AI_PARSER']['BASE_URL'].$this->settings['AI_PARSER']['FIND_RESUMES'];
    $post = json_encode($_POST);
    
    $configurationDetails   = new Curl(array(
        'endpoint'      => $endpoint,
        'username'      => $username,
        'password'      => $password,
        'postData'      => $post
     ));
    
    return $configurationDetails->loadAICurl();
});

//download resume
$app->get('/getResumeDownload',function ($request, $response, $args) use ($app) {
 
   // dynamically Access Token
  $this->mintmeshAccessToken;
  $this->mintmeshCompanyId;
  //$_POST['time_zone'] = $_SESSION['time_zone'];
   // getting API endpoint from settings
  $apiEndpoint = getapiEndpoint($this->settings, 'getResumeDownload');
 
   $downloadDetails    = new Curl(array(
       'url'           => $apiEndpoint,
       'postData'      => $_GET
    ));

   return checkJsonResult( $downloadDetails->loadCurl() );
   
});

//download resume Zip
$app->get('/getZipDownload',function ($request, $response, $args) use ($app) {
 
   // dynamically Access Token
  $this->mintmeshAccessToken;
  $this->mintmeshCompanyId;
  //$_POST['time_zone'] = $_SESSION['time_zone'];
   // getting API endpoint from settings
  $apiEndpoint = getapiEndpoint($this->settings, 'getZipDownload');
 
   $downloadDetails    = new Curl(array(
       'url'           => $apiEndpoint,
       'postData'      => $_GET
    ));

   return checkJsonResult( $downloadDetails->loadCurl() );
   
});

