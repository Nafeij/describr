package expo.modules.intentmanager

import android.app.Activity
import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
class IntentManagerModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a
    // string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for
    // clarity.
    // The module will be accessible from `requireNativeModule('IntentManager')` in JavaScript.
    Name("IntentManager")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a
    // dictionary.
    // Constants("PI" to Math.PI)

    // // Defines event names that the module can send to JavaScript.
    // Events("onChange")

    // // Defines a JavaScript synchronous function that runs the native code on the JavaScript
    // thread.
    // Function("hello") { "Hello world! 👋" }

    // Function("getActivityName") {
    //   currentActivity.javaClass.simpleName
    // }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    // AsyncFunction("setValueAsync") { value: String ->
    //   // Send an event to JavaScript.
    //   sendEvent("onChange", mapOf("value" to value))
    // }

    Function("getIntent") { getIntent() }

    Function("setResult") { options: ResultOptions -> setResult(options) }
  }

  private val currentActivity
    get() =
        appContext.activityProvider?.currentActivity
            ?: throw CodedException(
                "Activity which was provided during module initialization is no longer available."
            )

  private val context
    get() = requireNotNull(appContext.reactContext)

  private fun getIntent(): Map<String, Any?> {
    val intent = currentActivity.intent
    return mapOf(
        "action" to intent.action,
        "categories" to intent.categories?.toList(),
        "data" to intent.dataString,
        "type" to intent.type,
        "flags" to intent.flags,
        "extras" to intent.extras
    )
  }

  private fun setResult(options: ResultOptions) {
    val resultCode = Activity.RESULT_OK
    val resultIntent =
        Intent(
            if (options.action != null) options.action else context.packageName + ".RESULT_ACTION"
        )
    resultIntent.data = Uri.parse(options.uri)
    resultIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    currentActivity.setResult(resultCode, resultIntent)
    currentActivity.finish()
  }
}