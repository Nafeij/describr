package expo.modules.intentmanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.CodedException

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

    // // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
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

    Function("getIntent") {
      getIntent()
    }
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  private val currentActivity
    get() =
        appContext.activityProvider?.currentActivity
            ?: throw CodedException(
                "Activity which was provided during module initialization is no longer available"
            )

  private fun getIntent(): Map<String, Any?> {
    val intent = currentActivity.intent
    return mapOf(
      "action" to intent.action,
      "data" to intent.dataString,
      "type" to intent.type,
      "flags" to intent.flags,
      "extras" to intent.extras?.keySet()?.toList()
    )
  }
}
