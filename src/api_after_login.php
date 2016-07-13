<?php
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


//Logout
$app->get("/logout", function ($request, $response, $args) { 
    session_destroy(); 
    //Arguments
    $args       = commonArgs($this->settings);
    return $response->withRedirect($args['APP_DOMAIN']);
}); 
