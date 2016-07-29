<?php
/**
 * Slim - a micro PHP 5 framework
 *
 * @author      Himabindu
 *  @package    Slim
  */
class Session
{
    /**
     * When user login this set function set the data in to session
     *
     * @param  array $data
     * @return mixed
     */

    public function set($data)
    {
       $_SESSION = $data;
    }

    /**
     * get the data based on the key
     *
     * @param  string $key
     * @return value in session
     */
     
    public function get($key)
    {
        return (isset($_SESSION[$key])) ? $_SESSION[$key] : false;
    }

    /**
     * unset the session data based on the key
     *
     * @param  string $key
     * @return integer
     */

    public function delete($key)
    {
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
            return true;
        }
        return false;
    }
    
    /**
     * destroy the session 
     */
       
    public function destroy()
    {
        return session_destroy();
    }
    
    

}