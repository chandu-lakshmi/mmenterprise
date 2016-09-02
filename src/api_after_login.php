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

    $args['comp_data'] = companyProfile($this->settings);
 
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
        
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

    $args['comp_data'] = companyProfile($this->settings);

    // Render dashboard view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Post Job Page
$app->get('/job/post-job-2',function ($request, $response, $args) use ($app) {
     
     //Arguments
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

     return $response->withRedirect($args['APP_DOMAIN']."job/post-job");
});

//Post job Page
$app->get('/postJob',function ($request, $response, $args) use ($app) {
	//Arguments
    $this->mintmeshAccessToken;
    $args       = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    $args['comp_data'] = companyProfile($this->settings);

    // Render dashboard view
    return $this->renderer->render($response, 'post-job.phtml', $args);
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
    
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'job_details');
   
    $jobDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobDetails->loadCurl() );
    
});

//Job Referral Details
$app->post('/job_referral_details',function ($request, $response, $args) use ($app) {
   
    // dynamically Access Token, Company Details 
   $this->mintmeshAccessToken;
   $this->mintmeshCompanyId;
    
    // getting API endpoint from settings
   $apiEndpoint = getapiEndpoint($this->settings, 'job_referral_details');
   
    $jobDetails    = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    
    return checkJsonResult( $jobDetails->loadCurl() );
    
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
/*$app->post('/get_services',function ($request, $response, $args) use ($app) {
    
      // dynamically Access Token
  $this->mintmeshAccessToken;
     
   // getting API endpoint from settings
  $apiEndpoint = getapiEndpoint($this->settings, 'process_job');
  $_POST["service_type"] = "global";
  $_POST["user_country"] = "all";

   $getServicesDetails    = new Curl(array(
       'url'           => $apiEndpoint,
       'postData'      => $_POST
    ));
   
   return checkJsonResult( $getServicesDetails->loadCurl() );

});*/



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

//Dashboard Details
$app->post('/view_dashboard',function ($request, $response, $args) use ($app) {
    
    // dynamically Access Token
    $this->mintmeshAccessToken;  
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

// Upload contacts -> if reload redirect to contacts page
$app->get('/contacts/upload-contacts',function ($request, $response, $args) use ($app) {
     
    //Arguments
    $this->mintmeshAccessToken;
    $args  = commonData($this->settings);
    
    //Check Logged in or not
    if(!empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']);
    }

    return $response->withRedirect($args['APP_DOMAIN']."contacts");
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
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'view_company_details');
   
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
                'txt', 'rtf', 'wps', 'csv', 'xml', 'otf', 'eot',
                'mp3', 'm4a', 'aac', 'wmv', 'wma', 'avi', 'mp4', 'mov', 'mpg', 'qxd', 'qxp', 'swf', 'fla', 'odt', 'vsd', 'wav', 'aiff',
                'sit', 'sitx', 'numbers', 'pages', 'key', 'ps', 'avi');
            // max file size in bytes
            $sizeLimit = 26 * 1024 * 1024;
            $myfilename = 'attach_' . mt_rand().time();
            //upload the file and validate the size and file type
            $uploader = $file_upload->fileUpload($allowedExtensions, $sizeLimit);
            //return the file original and source name and path
            $path = $args['PATH'];
            $result = $file_upload->handleUpload(''.$path.'public/uploads/', FALSE, $myfilename);
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
                $result['filename'] = 'public/uploads/'.$myfilename.'.'.$result['ext'];
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
 $app->get('/view_company_detail324',function ($request, $response, $args) {
    $this->mintmeshAccessToken;
  print_r(companyProfile($this->settings));
});
