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
package io.openliberty.guides.bulkhead.global.eBank.microservices;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;

import org.eclipse.microprofile.faulttolerance.Asynchronous;
import org.eclipse.microprofile.faulttolerance.Bulkhead;
import org.eclipse.microprofile.faulttolerance.Fallback;

import java.util.concurrent.Future;
import java.util.concurrent.CompletableFuture;



@ApplicationScoped
public class BankService {

    // For demo purpose only
    // The length of time (in milliseconds) to pause the currently executing thread 
    // so as to simulate concurrency
    public static final int TIMEOUT = 20000;

    public final static int bulkheadValue = 5;
    public final static int bulkheadWaitingQueue = 5;
 
    @Inject private BankService bankService;
    private int counterForVFA = 0;


    public Future<Service> requestForVFA() throws Exception {
        counterForVFA++;
        return bankService.serviceForVFA(counterForVFA);
    }

    @Fallback(ServiceFallbackHandler.class)
    @Asynchronous
    @Bulkhead(value = bulkheadValue, waitingTaskQueue = bulkheadWaitingQueue)
    public Future<Service> serviceForVFA(int counterForVFA) throws Exception {
        Service chatService = new ChatSession(counterForVFA);
        return CompletableFuture.completedFuture(chatService);           
    }
}