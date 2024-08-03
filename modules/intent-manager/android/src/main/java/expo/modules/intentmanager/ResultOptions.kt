package expo.modules.intentmanager

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

internal data class ResultOptions(
  @Field
  var isOk: Boolean = false,

  @Field
  var action: String? = null,

  @Field
  var uris: List<String> = emptyList()
) : Record