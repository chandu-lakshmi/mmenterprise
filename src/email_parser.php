<?php

//email parser

//Index page
$app->get('/email', function ($request, $response, $args) {
    
    $args = parserData($this->settings);

    // Render index view
    return $this->email_renderer->render($response, 'index.phtml', $args);
        
});

// All Jobs
$app->get('/email/all-jobs/{status}', function ($request, $response, $args) {

    if(!empty($_SESSION['CampaignDetails']) && isset($_SESSION['CampaignDetails'])){
        $arrayList["CampaignDetails"] = array();
        updateSession($arrayList);
    }
    
    $args = parserData($this->settings);
    $args['ref'] = $_GET['ref'];
    $_POST['ref'] = $args['ref'];
    $_POST['all_jobs'] = 1;
    $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_ref');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $args['referralDetails'] = checkJsonResult( $Details->loadCurl() ); 
    $checkResult['refDetails'] = json_decode($args['referralDetails']);
    $args['ngMeta'] = $checkResult['refDetails'];
    // Render index view
    if(!empty($checkResult['refDetails'])){
        return $this->email_renderer->render($response, 'index.phtml', $args);
    }
    else{
       return $response->withRedirect($args['APP_DOMAIN'].'404');
    }  
        
});

// All Campaigns
$app->get('/email/all-campaigns/{status}', function ($request, $response, $args) {
    
    $args = parserData($this->settings);
    $args['camp_ref'] = $_GET['ref'];
    $_POST['ref'] = $args['camp_ref'];
    $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_campaign_ref');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $args['campaignDetails'] = checkJsonResult( $Details->loadCurl() ); 
    $checkResult['campDetails'] = json_decode($args['campaignDetails']);
    $args['ngMeta'] = $checkResult['campDetails'];
    $arrayList["CampaignDetails"] = array(
        "camp_ref" => $args['camp_ref'],
        "campaign_id" => $checkResult['campDetails']->campaign_id,
        "reference_id" => $checkResult['campDetails']->reference_id
    );
    //Update Session
    updateSession($arrayList);
    // Render index view
    if(!empty($checkResult['campDetails'])){
        return $this->email_renderer->render($response, 'index.phtml', $args);
    }
    else{
       return $response->withRedirect($args['APP_DOMAIN'].'404');
    }  
        
});

// perticular Jobs
$app->get('/email/job-details/{status}', function ($request, $response, $args) {
    // campaign details
    $this->CampaignDetails;
    $args = parserData($this->settings);
    $args['ref'] = $_GET['ref'];
    $args['camp_ref'] = $_POST['camp_ref'];
    $_POST['ref'] = $args['ref'];
    $_POST['all_jobs'] = 0;
    $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_ref');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $args['referralDetails'] = checkJsonResult( $Details->loadCurl() );   
    $checkResult['refDetails'] = json_decode($args['referralDetails']);
    $args['ngMeta'] = $checkResult['refDetails'];
    // Render index view
    if(!empty($checkResult['refDetails'])){
        return $this->email_renderer->render($response, 'index.phtml', $args);
    }
    else{
        return $response->withRedirect($args['APP_DOMAIN'].'404');
    }  
        
});

// All Jobs
$app->get('/email/candidate-details/{status}', function ($request, $response, $args) {
    // campaign details
    $this->CampaignDetails;
    $args = parserData($this->settings);
    $args['camp_ref'] = $_POST['camp_ref'];
    $args['ref'] = $_GET['ref'];
    if($_GET['jc'] == 2){
        $_POST['reference_id'] = $args['ref'];
        $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_mobile_ref');
        $Details     = new Curl(array(
            'url'           => $apiEndpoint,
            'postData'      => $_POST
        ));
        $args['referralDetails'] = checkJsonResult( $Details->loadCurl() );
    } else if($_GET['jc'] == 1){
        $_POST['ref'] = $args['camp_ref'];
        $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_campaign_ref');
        $Details     = new Curl(array(
            'url'           => $apiEndpoint,
            'postData'      => $_POST
        ));
        $args['campaignDetails'] = checkJsonResult( $Details->loadCurl() );
    } else {
        $_POST['ref'] = $args['ref'];
        $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_ref');
        $Details     = new Curl(array(
            'url'           => $apiEndpoint,
            'postData'      => $_POST
        ));
        $args['referralDetails'] = checkJsonResult( $Details->loadCurl());
    }
    $checkResult['refDetails'] = json_decode(checkJsonResult( $Details->loadCurl()));
    // Render index view
    if(!empty($checkResult['refDetails'])){
        return $this->email_renderer->render($response, 'index.phtml', $args);
    }
    else{
       return $response->withRedirect($args['APP_DOMAIN'].'404');
    }  
});

// All Jobs
$app->get('/email/referral-details/{status}', function ($request, $response, $args) {
    // campaign details
    $this->CampaignDetails;
    $args = parserData($this->settings);
    $args['camp_ref'] = $_POST['camp_ref'];
    $args['ref'] = $_GET['ref'];
    if($_GET['jc'] == 1){
        $_POST['ref'] = $args['camp_ref'];
        $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_campaign_ref');
        $Details     = new Curl(array(
            'url'           => $apiEndpoint,
            'postData'      => $_POST
        ));
        $args['campaignDetails'] = checkJsonResult( $Details->loadCurl() );
    }
    else{
        $_POST['ref'] = $args['ref'];
        $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_ref');
        $Details     = new Curl(array(
            'url'           => $apiEndpoint,
            'postData'      => $_POST
        ));
        $args['referralDetails'] = checkJsonResult( $Details->loadCurl());
    }
    $checkResult['refDetails'] = json_decode(checkJsonResult( $Details->loadCurl()));  
    // Render index view
    if(!empty($checkResult['refDetails'])){
        return $this->email_renderer->render($response, 'index.phtml', $args);
    }
    else{
       return $response->withRedirect($args['APP_DOMAIN'].'404');
    }  
        
});

$app->post('/apply_job',function ($request, $response, $args) use ($app) {
    $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_ref');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $args['referralDetails'] = checkJsonResult( $Details->loadCurl() );
    $checkResult['refDetails'] = json_decode($args['referralDetails']);
    $_POST['post_id'] =  $checkResult['refDetails']->post_id;
    $_POST['reference_id'] =  $checkResult['refDetails']->reference_id;
    $apiEndpoint = getapiEndpoint($this->settings, 'apply_job');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $Details->loadCurl() );
});

$app->post('/apply_job_ref',function ($request, $response, $args) use ($app) {
//    $apiEndpoint = getapiEndpoint($this->settings, 'decrypt_campaign_ref');
//    $Details     = new Curl(array(
//        'url'           => $apiEndpoint,
//        'postData'      => $_POST
//    ));
//    $args['referralDetails'] = checkJsonResult( $Details->loadCurl() );
//    $checkResult['refDetails'] = json_decode($args['referralDetails']);
    //print_r($checkResult).exit;
    //$_POST['post_id'] =  $checkResult['refDetails']->post_id;
    //$_POST['reference_id'] =  $checkResult['refDetails']->reference_id;
    print_r($_POST).exit;
    $apiEndpoint = getapiEndpoint($this->settings, 'apply_job_ref');
    $Details     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $Details->loadCurl() );
});

$app->post('/apply_jobs_list',function ($request, $response, $args) use ($app) {
    
    $apiEndpoint = getapiEndpoint($this->settings, 'apply_jobs_list');
    $allJobs     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $allJobs->loadCurl() );
});

$app->post('/apply_job_details',function ($request, $response, $args) use ($app) {
    
    $apiEndpoint = getapiEndpoint($this->settings, 'apply_job_details');
    $allJobs     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $allJobs->loadCurl() );
});

$app->post('/campaign_jobs_list',function ($request, $response, $args) use ($app) {
    $this->CampaignDetails;
    $apiEndpoint = getapiEndpoint($this->settings, 'campaign_jobs_list');
    $allJobs     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
     return checkJsonResult( $allJobs->loadCurl() );
});
 
$app->POST('/resumes_upload',function ($request, $response, $args) {

    require 'library/fileupload_library.php';
    $args       = parserData($this->settings);
    $file_upload = new fileupload_library; 
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
            $result = $file_upload->handleUpload(''.$path.'uploads/Resumes', FALSE, $myfilename);
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
                $result['filename'] = 'uploads/Resumes'.$myfilename.'.'.$result['ext'];
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
