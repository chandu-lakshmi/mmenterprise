<?php

//email parser

//Index page
$app->get('/email-parser/', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);

    // Render index view
    return $this->email_renderer->render($response, 'index.phtml', $args);
        
});

// All Jobs
$app->get('/email-parser/all-jobs', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);

    // Render index view
    return $this->email_renderer->render($response, 'index.phtml', $args);
        
});

// All Jobs
$app->get('/email-parser/candidate-details', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);

    // Render index view
    return $this->email_renderer->render($response, 'index.phtml', $args);
        
});

// All Jobs
$app->get('/email-parser/referral-details', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);

    // Render index view
    return $this->email_renderer->render($response, 'index.phtml', $args);
        
});
