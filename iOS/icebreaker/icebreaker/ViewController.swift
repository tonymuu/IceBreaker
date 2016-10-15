import UIKit
import FBSDKLoginKit
import Alamofire


class ViewController: UIViewController, FBSDKLoginButtonDelegate {
    override func viewDidLoad() {
        super.viewDidLoad()
        let loginButton: FBSDKLoginButton = FBSDKLoginButton()
        loginButton.delegate = self
        loginButton.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(loginButton)
        
        let horizontalConstraint = NSLayoutConstraint(item: self.view, attribute: .centerX, relatedBy: .equal, toItem: loginButton, attribute: .centerX, multiplier: 1, constant: 0)
        let verticalConstraint = NSLayoutConstraint(item: self.view, attribute: .bottom, relatedBy: .equal, toItem: loginButton, attribute: .bottom, multiplier: 1, constant: 120)
        
        self.view.addConstraint(horizontalConstraint)
        self.view.addConstraint(verticalConstraint)

    }

    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if(error != nil) {
            print(error)
        } else if result.isCancelled {
            print("canceled")
        } else {
            print("Logged in!")
            returnUserData()
            
        }
    }
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        
    }
    func returnUserData() {
        print(FBSDKAccessToken.current().tokenString)
        if let token = FBSDKAccessToken.current().tokenString {
            // important! it has to be named "access token" to authenticate.
            let dict = ["access_token": token]
            
            let vc = self.storyboard?.instantiateViewController(withIdentifier: "YourProfileVC") as! YourProfileViewController
            let navigationVC = UINavigationController(rootViewController: vc)
            navigationVC.navigationBar.barTintColor = Constants.backgroundColor.dark
            
            
            Alamofire.request(Constants.URIs.baseUri + Constants.routes.auth, method: .get, parameters: dict, encoding: URLEncoding.default).responseJSON { response in
                print(response.request)
                if (FBSDKAccessToken.current() != nil) {
                    self.present(navigationVC, animated: true, completion: nil)
                } else {
                    print("You are logged out")
                }
            }
        }
    }

}

