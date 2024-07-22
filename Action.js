/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
const Multipassify = require('multipassify');

exports.onExecutePostLogin = async (event, api) => {
  const multipassSecret = event.client.metadata.shopify_multipass_secret;

  if (!multipassSecret) {
    api.access.deny(`Multipass secret is not configured.`);
    return;
  }

  try {
    // Construct the Multipassify encoder
    const multipassify = new Multipassify(multipassSecret);

    // Create your customer data hash
    const customerData = {
      email: event.user.email,
      remote_ip: event.request.ip,
      return_to: "https://paulcochrane.myshopify.com",
    };

    // Encode a Multipass token
    const token = multipassify.encode(customerData);

    // Generate a Shopify multipass URL to your shop
    const url = multipassify.generateUrl(customerData, "paulcochrane.myshopify.com");

    // Generates a URL like: https://yourstorename.myshopify.com/account/login/multipass/<MULTIPASS-TOKEN>

    // Redirect
    api.redirect.sendUserTo(url);

    return event;
  } catch (error) {
    console.error('Error generating Multipass token:', error);
    api.access.deny(`Error generating Multipass token: ${error.message}`);
  }
};

/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
