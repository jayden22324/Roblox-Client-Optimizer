// RCOWinAPI.cc
// Licensed under GPL-3.0

#include <node.h>
#include <Windows.h>

namespace RCOWinAPI {
	void showConsole(const v8::FunctionCallbackInfo<v8::Value>& args) {
		ShowWindow(GetConsoleWindow(), SW_SHOW);
	}

	void hideConsole(const v8::FunctionCallbackInfo<v8::Value>& args) {
		ShowWindow(GetConsoleWindow(), SW_HIDE);
	}

	void Initialize(v8::Local<v8::Object> exports) {
		NODE_SET_METHOD(exports, "showConsoleWin32", showConsole);
		NODE_SET_METHOD(exports, "hideConsoleWin32", hideConsole);
	}

	NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}
