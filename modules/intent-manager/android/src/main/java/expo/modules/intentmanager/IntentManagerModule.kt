package expo.modules.intentmanager

import android.app.Activity
import android.content.Intent
import android.net.Uri
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
class IntentManagerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IntentManager")

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