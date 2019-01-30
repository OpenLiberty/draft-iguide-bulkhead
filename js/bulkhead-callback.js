/*******************************************************************************
* Copyright (c) 2018 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/
var bulkheadCallBack = (function() {

    var bankServiceFileName = "BankService.java";
    var htmlRootDir = "/guides/iguide-bulkhead/html/";
    var mapStepNameToScollLine = { 'AsyncWithoutBulkhead': 23, 
                                   'BulkheadAnnotation': 24, 
                                   'AsyncBulkheadAnnotation': 32,
                                   'Fallback': 17 };

    /** AddLibertyMPFaultTolerance step  begin */
    var addMicroProfileFaultToleranceFeatureButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addMicroProfileFaultToleranceFeature();
        }
    };

    var __addMicroProfileFaultToleranceFeature = function() {
        var FTFeature = "      <feature>mpFaultTolerance-1.0</feature>";
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.focusTabbedEditorByName(stepName, serverFileName);
        contentManager.resetTabbedEditorContents(stepName, serverFileName);
        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);

        contentManager.insertTabbedEditorContents(stepName, serverFileName, 5, FTFeature);
        var readOnlyLines = [];
        // mark cdi feature line readonly
        readOnlyLines.push({
            from: 4,
            to: 4
        });
        contentManager.markTabbedEditorReadOnlyLines(stepName, serverFileName, readOnlyLines);
    };

    var __getMicroProfileFaultToleranceFeatureContent = function(content) {
        var editorContents = {};
        try {
            // match
            // <featureManager>
            //    <anything here>
            // </featureManager>
            // and capturing groups to get content before featureManager, the feature, and after
            // featureManager content.
            var featureManagerToMatch = "([\\s\\S]*)<featureManager>([\\s\\S]*)<\\/featureManager>([\\s\\S]*)";
            var regExpToMatch = new RegExp(featureManagerToMatch, "g");
            var groups = regExpToMatch.exec(content);
            editorContents.beforeFeature = groups[1];
            editorContents.features = groups[2];
            editorContents.afterFeature = groups[3];
        }
        catch (e) {
        }
        return editorContents;
    };

     var __isFaultToleranceInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>mpFaultTolerance-1.0</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __isCDIInFeatures = function(features) {
        var match = false;
        features = features.replace('\n', '');
        features = features.replace(/\s/g, ''); // Remove whitespace
        try {
            var featureMatches = features.match(/<feature>[\s\S]*?<\/feature>/g);
            $(featureMatches).each(function (index, feature) {
                if (feature.indexOf("<feature>cdi-1.2</feature>") !== -1) {
                    match = true;
                    return false; // break out of each loop
                }
            });
        }
        catch (e) {
        }
        return match;
    };

    var __checkMicroProfileFaultToleranceFeatureContent = function(content) {
        var isFTFeatureThere = true;
        var editorContentBreakdown = __getMicroProfileFaultToleranceFeatureContent(content);
        if (editorContentBreakdown.hasOwnProperty("features")) {
            isFTFeatureThere =  __isFaultToleranceInFeatures(editorContentBreakdown.features) &&
                                __isCDIInFeatures(editorContentBreakdown.features);
            if (isFTFeatureThere) {
                // check for whether other stuffs are there
                var features = editorContentBreakdown.features;
                features = features.replace('\n', '');
                features = features.replace(/\s/g, '');
                if (features.length !== "<feature>mpFaultTolerance-1.0</feature><feature>cdi-1.2</feature>".length) {
                    isFTFeatureThere = false; // contains extra text
                }
            }
        } else {
            isFTFeatureThere = false;
        }
        return isFTFeatureThere;
    };

    var __saveServerXML = function(editor) {
        var stepName = stepContent.getCurrentStepName();
        var serverFileName = "server.xml";

        var content = contentManager.getTabbedEditorContents(stepName, serverFileName);
        utils.validateContentAndSave(stepName, editor, content, __checkMicroProfileFaultToleranceFeatureContent, __correctEditorError);
    };

    var __listenToEditorForFeatureInServerXML = function(editor) {
        var saveServerXML = function(editor) {
            __saveServerXML(editor);
        };
        editor.addSaveListener(saveServerXML);
    };

    var saveServerXMLButton = function(event) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            contentManager.saveTabbedEditor(stepContent.getCurrentStepName(), "server.xml");
        }
    };
    /** AddLibertyMPFaultTolerance step  end */

    var __saveButtonEditor = function(stepName) {
        contentManager.saveTabbedEditor(stepName, bankServiceFileName);
    };

    var saveButtonEditorButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __saveButtonEditor(stepName);
        }
    };

    var __showPodWithRequestButtonAndBrowser = function(editor) {
        var stepName = editor.getStepName();
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);

        var htmlFile;
        if (stepName === "BulkheadAnnotation") {
            htmlFile = htmlRootDir + "virtual-financial-advisor-bulkhead.html";
        } else if (stepName === "AsyncBulkheadAnnotation") {
            htmlFile = htmlRootDir + "virtual-financial-advisor-asyncbulkhead.html";
        }

        var updateSuccess = false;
        if (__checkEditorContent(stepName, content)) {
            updateSuccess = true;
            var index = contentManager.getCurrentInstructionIndex();
            if(index === 0){
                if (htmlFile) {
                    var stepWidgets = stepContent.getStepWidgets(stepName);
                    stepContent.resizeStepWidgets(stepWidgets, "pod", true);
                    // display the pod with chat button and web browser in it
                    contentManager.setPodContent(stepName, htmlFile);
                }

            }
        }
        utils.handleEditorSave(stepName, editor, updateSuccess, __correctEditorError, mapStepNameToScollLine[stepName], bankServiceFileName);
    };

    var __checkEditorContent = function(stepName, content) {
        var contentIsCorrect = true;
        if (stepName === "AsyncWithoutBulkhead") {
            contentIsCorrect = __validateEditorContentInJavaConcurrencyStep(content);
        } else if (stepName === "BulkheadAnnotation") {
            contentIsCorrect = __validateEditorContent_BulkheadStep(content);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            contentIsCorrect = __validateEditorContent_AsyncBulkheadStep(content);
        } else if (stepName === "Fallback") {
            contentIsCorrect = __validateEditorContent_FallbackStep(content);
        }
        return contentIsCorrect;
    };

    var __correctEditorError = function(stepName) {
        if (stepName === "AsyncWithoutBulkhead") {
            __addJavaConcurrencyInEditor(stepName);
        } else if (stepName === "BulkheadAnnotation") {
            __addBulkheadInEditor(stepName);
        } else if (stepName === "AsyncBulkheadAnnotation") {
            var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
            var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);
            __addAsyncBulkheadInEditor(stepName);
            if (hasRequestForVFAMethod === false) {
                __updateAsyncBulkheadMethodInEditor(stepName, false);
            }
        } else if (stepName === "Fallback") {
            __addFallbackAsyncBulkheadInEditor(stepName);
        } else if (stepName === "AddLibertyMPFaultTolerance") {
            __addMicroProfileFaultToleranceFeature();    
        }

    };

    var listenToEditorForJavaConcurrency = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addJavaConcurrencyInEditor = function(stepName) {
        // reset content every time annotation is added through the button so as to clear out any
        // manual editing
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent =
            "  public Future<Service> requestForVFA() {\n" +
            "    counterForVFA++;\n" +
            "    ExecutorService executor = Executors.newSingleThreadExecutor();\n" +
            "    Future<Service> serviceRequest = executor.submit(() -> {\n" +
            "      try {\n" +
            "        return bankService.serviceForVFA(counterForVFA);\n" +
            "      } catch (Exception ex) {\n" +
            "        handleException();\n" +
            "      }\n" +
            "      return null;\n" +
            "    });\n" +
            "    return serviceRequest;\n" +
            "  }";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 10, 13, newContent, 13);
        // line number to scroll to = insert line + the number of lines to be insert 
        // for this example 10 + 13 = 23
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var __validateEditorContentInJavaConcurrencyStep = function(content) {
        var match = false;
        try {
            var codesToMatch = "private int counterForVFA = 0;\\s*" + // boundary which is readonly
                "public\\s+Future\\s*<\\s*Service\\s*>\\s*requestForVFA\\s*\\(\\s*\\)\\s*{\\s*" +
                "counterForVFA\\s*\\+\\+;\\s*" +
                "ExecutorService\\s+executor\\s*=\\s*Executors\\s*\\.\\s*newSingleThreadExecutor\\s*\\(\\s*\\)\\s*;\\s*" +
                "Future\\s*<\\s*Service\\s*>\\s*serviceRequest\\s*=\\s*executor\\s*\\.\\s*submit\\s*\\(\\s*\\(\\s*\\)\\s*->\\s*{\\s*" +
                "try\\s*{\\s*" +
                "return\\s+bankService\\s*.\\s*serviceForVFA\\s*\\(\\s*counterForVFA\\s*\\)\\s*;\\s*" +
                "}\\s*catch\\s*\\(\\s*Exception\\s+ex\\s*\\)\\s*{\\s*" +
                "handleException\\s*\\(\\s*\\)\\s*;\\s*" +
                "}\\s*" +
                "return\\s+null\\s*;\\s*" +
                "}\\s*\\)\\s*;\\s*" +
                "return\\s+serviceRequest\\s*;\\s*" +
                "}\\s*" +
                "public Service serviceForVFA";  // boundary which is readonly
            var regExpToMatch = new RegExp(codesToMatch, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {
            // do nothing as match is already set to false
        }
        return match;
    };

    var __validateEditorContent_BulkheadStep = function(content) {
        var match = false;
        try {
            var pattern = "return serviceRequest;\\s*}\\s*" + // readonly boundary
            "@Bulkhead\\s*\\(\\s*50\\s*\\)\\s*" +
            "public Service serviceForVFA"; // readonly boundary
            var regExpToMatch = new RegExp(pattern, "g");
            content.match(regExpToMatch)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __checkRequestForVFAMethod = function(content) {
        var match = false;
        try {
            var pattern = "counterForVFA = 0;\\s*" + // readonly boundary
                    "public\\s+Future\\s*<\\s*Service\\s*>\\s*requestForVFA\\s*\\(\\s*\\)\\s*{\\s*" +
                    "counterForVFA\\s*\\+\\+\\s*;\\s*" +
                    "return\\s+bankService\\s*.\\s*serviceForVFA\\s*\\(\\s*counterForVFA\\s*\\)\\s*;\\s*" +
                    "}\\s*@";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __checkServiceForVFAMethod = function(content) {
        var match = false;
        try {
            var pattern = ";\\s*}\\s*" +
                "@Asynchronous\\s*@Bulkhead\\s*\\(\\s*value\\s*=\\s*50\\s*,\\s*" + 
                "waitingTaskQueue\\s*=\\s*50\\s*\\)\\s*" +
                "public\\s+Future\\s*<\\s*Service\\s*>\\s*serviceForVFA\\s*\\(\\s*int\\s+counterForVFA\\s*\\)\\s*{\\s*" +
                "Service\\s+chatService\\s*=\\s*new\\s+ChatSession\\s*\\(\\s*counterForVFA\\s*\\);\\s*" + 
                "return\\s+CompletableFuture\\s*.\\s*completedFuture\\s*\\(\\s*chatService\\s*\\);\\s*" +
                "}\\s*}";
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var __validateEditorContent_AsyncBulkheadStep = function(content) {       
        var match = __checkServiceForVFAMethod(content) && __checkRequestForVFAMethod(content);
        return match;
    };

    var __validateEditorContent_FallbackStep = function(content) {
        var match = false;
        try {
            var pattern = "return bankService.serviceForVFA\\(counterForVFA\\);\\s*" + // readonly boundary
            "}\\s*" + 
            "@Fallback\\s*\\(\\s*ServiceFallbackHandler\\s*\\.\\s*class\\s*\\)\\s*" +
            "@Asynchronous"; // readonly boundary
            var regExp = new RegExp(pattern, "g");
            content.match(regExp)[0];
            match = true;
        } catch (ex) {

        }
        return match;
    };

    var listenToEditorForBulkheadAnnotation = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var __addBulkheadInEditor = function(stepName) {
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent = "  @Bulkhead(50)";
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 23, 23, newContent, 1);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var addJavaConcurrencyButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addJavaConcurrencyInEditor(stepName);
        }
    };

    var addBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            __addBulkheadInEditor(stepName);
        }
    };

    var clickChat = function(event, stepName, requestNum) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            handleNewChatRequestInBrowser(stepName, requestNum);
        }
    };

    var addAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addAsyncBulkheadInEditor(stepName);
        }
    };

    var __addAsyncBulkheadInEditor = function(stepName) {
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasRequestForVFAMethod = __checkRequestForVFAMethod(content);

        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
   
        var params = [];
        var constructAnnotation = function(params) {
            var bulkheadAnnotation = "  @Asynchronous\n" +
                                     "  @Bulkhead(";
            if ($.isArray(params) && params.length > 0) {
                bulkheadAnnotation += params.join(",\n            ");
            }
            bulkheadAnnotation += ")\n" +
                                    "  public Future<Service> serviceForVFA(int counterForVFA) {\n" +
                                    "    Service chatService = new ChatSession(counterForVFA);\n" +
                                    "    return CompletableFuture.completedFuture(chatService);\n" +
                                    "  }";
            return bulkheadAnnotation;
        };

        params[0] = "value=50";
        params[1] = "waitingTaskQueue=50";

        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 25, 30, constructAnnotation(params), 7);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
        if (hasRequestForVFAMethod === true) {
            __updateAsyncBulkheadMethodInEditor(stepName, false);
        }       
    };

    var listenToEditorForAsyncBulkhead = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var addFallbackAsyncBulkheadButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __addFallbackAsyncBulkheadInEditor(stepName);
        }
    };

    var __addFallbackAsyncBulkheadInEditor = function(stepName) {
        // Since the tabbed editor has 2 files for the fallback step, make sure the corrrect tab is in focus before
        // adding the new content.
        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var newContent =
            "  @Fallback(ServiceFallbackHandler.class)"; + 
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 16, 16, newContent, 1);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName]);
    };

    var listenToEditorForAsyncBulkheadFallback = function(editor) {
        editor.addSaveListener(__showPodWithRequestButtonAndBrowser);
    };

    var updateAsyncBulkheadMethodButton = function(event, stepName) {
        if (event.type === "click" ||
           (event.type === "keypress" && (event.which === 13 || event.which === 32))) {
            // Click or 'Enter' or 'Space' key event...
            __updateAsyncBulkheadMethodInEditor(stepName);
        }
    };

    var __updateAsyncBulkheadMethodInEditor = function(stepName, performReset) {
        var content = contentManager.getTabbedEditorContents(stepName, bankServiceFileName);
        var hasServiceForVFAMethod = __checkServiceForVFAMethod(content);

        var newContent = "  public Future<Service> requestForVFA() {\n" +
                         "    counterForVFA++;\n" + 
                         "    return bankService.serviceForVFA(counterForVFA);\n" +
                         "  }";

        contentManager.focusTabbedEditorByName(stepName, bankServiceFileName);
        if (performReset === undefined || performReset === true) {
            contentManager.resetTabbedEditorContents(stepName, bankServiceFileName);
        }
        contentManager.replaceTabbedEditorContents(stepName, bankServiceFileName, 11, 23, newContent, 4);
        contentManager.scrollTabbedEditorToView(stepName, bankServiceFileName, mapStepNameToScollLine[stepName] - 17);

        if (hasServiceForVFAMethod === true && (performReset === undefined || performReset === true)) {
            __addAsyncBulkheadInEditor(stepName);
        }
    };

    var __browserVirtualAdvisorBaseURL = "https://global-ebank.openliberty.io/virtualFinancialAdvisor/";
    var handleNewChatRequestInBrowser = function(stepName, requestNum) {
        var browserChatHTML = htmlRootDir + "virtual-financial-advisor-chat.html";  
        var browserContentHTML = htmlRootDir + "virtual-financial-advisor-connecting.html";  
        var browserUrl = __browserVirtualAdvisorBaseURL + "Advisor" + requestNum;
        var browserErrorUrl = __browserVirtualAdvisorBaseURL + "error";
        var requestLimits = 1;
        var browser = contentManager.getBrowser(stepName);

        // only mark current instruction as complete and delay showing the next instruction until processing is done
        contentManager.markCurrentInstructionComplete(stepName);
        if (stepName === "AsyncWithoutBulkhead") {
            requestLimits = 3;
            if (requestNum === 2) {
                browserChatHTML = htmlRootDir + "virtual-financial-advisor-chat-2.html";
            } else if (requestNum >= requestLimits) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-error-503.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "ExampleScenario") {
            requestLimits = 2;
            if (requestNum >= requestLimits) {        
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-no-available.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "BulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === requestLimits) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", browserErrorUrl,
                                 htmlRootDir + "virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > requestLimits) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "AsyncBulkheadAnnotation") {
            requestLimits = 2;
            if (requestNum === 2) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue",
                                 htmlRootDir + "virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", browserErrorUrl,
                                 htmlRootDir + "virtual-financial-advisor-bulkhead-error.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-bulkhead-error.html";
                browserUrl = browserErrorUrl;
            }
        } else if (stepName === "Fallback") {
            requestLimits = 2;
            if (requestNum === 2) {
                browser.setBrowserContent(htmlRootDir + "virtual-financial-advisor-processing.html");
                __incrementCounts(stepName, 2, 51, ".busyCount", __browserVirtualAdvisorBaseURL + "waitingqueue", 
                                 htmlRootDir + "virtual-financial-advisor-waitingqueue.html", true);
                return;
            } else if (requestNum === 3) {
                browser.getIframeDOM().find(".errorTextBox").hide();
                __incrementCounts(stepName, 2, 51, ".waitCount", __browserVirtualAdvisorBaseURL + "scheduleAppointment",
                                 htmlRootDir + "virtual-financial-advisor-fallback.html");
                return;
            } else if (requestNum > 3) {
                browserContentHTML = htmlRootDir + "virtual-financial-advisor-fallback.html";
                browserUrl = __browserVirtualAdvisorBaseURL + "scheduleAppointment";
            }
        }

        contentManager.setBrowserURL(stepName, browserUrl, 0);
        browser.setBrowserContent(browserContentHTML);
        if (requestNum < requestLimits) {
            var pod = contentManager.getPod(stepName);
            setTimeout(function () {
                browser.setBrowserContent(browserChatHTML);

                // If there is a pod showing a dashboard, update its contents to show 1 chat
                if (pod !== null) {
                    // use a interval timer to make sure the browser content is rendered before updating the pod elements
                    var waitingForBrowserContentTimeInterval = setInterval(function () {
                        if (browser.getIframeDOM().find(".advisorName").length === 1) {
                            clearInterval(waitingForBrowserContentTimeInterval);
                            var $stepPod = pod.contentRootElement;
                            if (requestNum === 1) {
                                $stepPod.find(".busyCount").text(1);
                                $stepPod.find(".busyChatCount").attr("aria-label", bulkhead_messages.ONE_CHAT_INPROGRESS);
                                $stepPod.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.ONE_CHAT_INPROGRESS);
                            }
                        }
                    }, 10);
                }
            }, 1000);
        }
    };

    var __incrementCounts = function(stepName, startingCount, endingCount, elementToBeCounted, urlForAfterCount, htmlForAfterCount, startingWaitingQueue) {
        var timeInterval = setInterval(function () {
            var pod = contentManager.getPod(stepName);
            var browser = contentManager.getBrowser(stepName);
            if (pod && browser) {
                var chatSummary = pod.contentRootElement.find('.chatSummary');
                chatSummary.find(elementToBeCounted).text(startingCount);
                startingCount++;
                if (startingCount === endingCount) {
                    clearInterval(timeInterval);
                    contentManager.setBrowserURL(stepName, urlForAfterCount, 0);
                    browser.setBrowserContent(htmlForAfterCount);
                    if (startingWaitingQueue) {
                        chatSummary.find(".waitCount").addClass('chatSummaryTransition');
                        chatSummary.find(".waitCount").text(1);
                        chatSummary.find(".waitChatCount").attr("aria-label", bulkhead_messages.ONE_CHAT_WAITING);
                        chatSummary.find(".busyChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                        chatSummary.find(".waitChatCount").attr("data-externalizedarialabel", bulkhead_messages.ONE_CHAT_WAITING);
                        chatSummary.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_INPROGRESS);

                    } else {
                        if (elementToBeCounted === ".busyCount") {
                            chatSummary.find(".busyChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                            chatSummary.find(".busyChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_INPROGRESS);
                        } else {
                            chatSummary.find(".waitChatCount").attr("aria-label", bulkhead_messages.FIFTY_CHATS_WAITING);
                            chatSummary.find(".waitChatCount").attr("data-externalizedarialabel", bulkhead_messages.FIFTY_CHATS_WAITING);
                        }
                    }
                }
            }
        }, 20);
    };

    var __listenToPlaygroundEditorAnnotationChanges = function(editor){
        var __listenToContentChanges = function(editorInstance, changes) {
            // Get pod from contentManager
            var bulkhead = contentManager.getPlayground(editor.getStepName());
            // Get the parameters from the editor and send to the bulkhead
            var content = editor.getEditorContent();
            try{
                var matchPattern = "@Asynchronous\\s*@Bulkhead\\s*(\\(([^\\(\\)])*?\\))?\\s*public Future<Service> serviceForVFA";
                var regexToMatch = new RegExp(matchPattern, "g");
                var groups = regexToMatch.exec(content);
                var annotation = groups[1];                
                var value;
                var waitingTaskQueue;
                var errorPosted = false;

                if (annotation) {
                    // Parameters were specified in the annotation
                    var params = annotation.replace(/[{\s()}]/g, ''); // Remove whitespace and parenthesis
                    params = params.split(',');
    
                    // Parse their annotation for values
                    params.forEach(function(param, index){
                        var validParameters = false;
                        if (param.indexOf('value=') > -1){
                            value = parseInt(param.substring(param.indexOf('value=') + 6));
                            if (!isNaN(value)) validParameters = true;
                        }
                        if (param.indexOf('waitingTaskQueue=') > -1){
                            waitingTaskQueue = parseInt(param.substring(param.indexOf('waitingTaskQueue=') + 17));
                            if (!isNaN(waitingTaskQueue)) validParameters = true;
                        }
                        if (!validParameters && param !== "") {
                            editor.createCustomErrorMessage(bulkhead_messages.INVALID_PARMS);
                            errorPosted = true;
                        }
                    });    
                }

                if (!errorPosted) {
                    // Parameter value(s) syntax is good....check the values entered.
                    if (value != undefined) {
                        if (!utils.isInteger(value) || value < 1) {                        
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_GT_ZERO, ["value"]));
                            errorPosted = true;
                        } else if (value > 10) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_MAX_VALUE,["value"]));
                            errorPosted = true;
                        }    
                    } else {
                        value = 10; // Set to default value
                    }
                    
                    if (waitingTaskQueue != undefined) {
                        if(!utils.isInteger(waitingTaskQueue) || waitingTaskQueue < 1) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_GT_ZERO, ["waitingTaskQueue"]));
                            errorPosted = true;
                        } else if (waitingTaskQueue > 10) {
                            editor.createCustomErrorMessage(utils.formatString(bulkhead_messages.PARMS_MAX_VALUE,["waitingTaskQueue"]));
                            errorPosted = true;
                        }
                    } else {
                        waitingTaskQueue = 10;  // Set to default value
                    }
                }
                
                if (!errorPosted) {
                    // All looks good so far...update the playground.
                    if (waitingTaskQueue < value) {
                        editor.createCustomAlertMessage(bulkhead_messages.WAIT_BEST_PRACTICE);
                        // Do not return here.  Post warning and allow user to continue with their simulation.
                    } else {
                        // Clear out any previous error boxes displayed.
                        editor.closeEditorErrorBox();
                    }        
                    editorInstance.addCodeUpdated();          
                    // Apply the annotation values to the bulkhead.
                    // If not specified, the bulkhead will use its default value.
                    bulkhead.updateParameters.apply(bulkhead, [value, waitingTaskQueue]);
                    // Enable the playground buttons.
                    bulkhead.enableActions(true);
                } else {
                    // Error message was posted which must be fixed.  Don't allow processing
                    // of the playground until it is resolved.
                    bulkhead.enableActions(false);
                }
            }
            catch(e){
                editor.createCustomErrorMessage(bulkhead_messages.INVALID_PARMS);
                bulkhead.enableActions(false);
            }
        };
        editor.addSaveListener(__listenToContentChanges);
    };

    var __createAsyncBulkhead = function(root, stepName) {
        // If root is not a jQuery element, get the jQuery element from the root object passed in
        if(!root.selector){
            root = root.contentRootElement;
        }

        var ab = asyncBulkhead.create(root, stepName, 5, 5);
        root.asyncBulkhead = ab;

        root.find(".bulkheadThreadRequestButton").on("click", function() {
            ab.sendStartChatRequest();
        });
        root.find(".bulkheadThreadReleaseButton").on("click", function() {
            ab.sendEndChatRequest();
        });
        root.find(".bulkheadResetButton").on("click", function() {
            ab.resetQueues();
        });
        contentManager.setPlayground(stepName, ab, 0);
    };

    return {
        listenToEditorForFeatureInServerXML: __listenToEditorForFeatureInServerXML,
        addMicroProfileFaultToleranceFeatureButton: addMicroProfileFaultToleranceFeatureButton,
        saveServerXMLButton: saveServerXMLButton,
        addJavaConcurrencyButton: addJavaConcurrencyButton,
        addBulkheadButton: addBulkheadButton,
        saveButtonEditorButton: saveButtonEditorButton,
        listenToEditorForJavaConcurrency: listenToEditorForJavaConcurrency,
        clickChat: clickChat,
        listenToEditorForAsyncBulkhead: listenToEditorForAsyncBulkhead,
        addFallbackAsyncBulkheadButton: addFallbackAsyncBulkheadButton,
        listenToEditorForAsyncBulkheadFallback: listenToEditorForAsyncBulkheadFallback,
        handleNewChatRequestInBrowser: handleNewChatRequestInBrowser,
        addAsyncBulkheadButton: addAsyncBulkheadButton,
        updateAsyncBulkheadMethodButton: updateAsyncBulkheadMethodButton,
        listenToPlaygroundEditorAnnotationChanges: __listenToPlaygroundEditorAnnotationChanges,
        createAsyncBulkhead: __createAsyncBulkhead
    };

})();
